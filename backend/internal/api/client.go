package api

import (
	"database/sql"
	"encoding/json"
	"math"
	"net/http"
	"strconv"
	"strings"
	"time"
	"fmt"
	"backend/internal/models"
	"backend/internal/utils"

	"github.com/gorilla/mux"
	"github.com/lib/pq"
)

type handler struct {
	db *sql.DB
}

func (h *handler) getProducts(w http.ResponseWriter, r *http.Request) {
	pageStr := r.URL.Query().Get("page")
	limitStr := r.URL.Query().Get("limit")
	searchQuery := r.URL.Query().Get("search")
	categoryQuery := r.URL.Query().Get("category")
	useAISearch := r.URL.Query().Get("ai_search") == "true"

	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 { page = 1 }
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 { limit = 9 }
	offset := (page - 1) * limit

	var conditions []string
	var args []interface{}
	argId := 1
	var aiProductIDs []int

	// === LOGIC AI SEARCH ===
	if useAISearch && searchQuery != "" {
		aiIDs, aiErr := callAISearch(searchQuery, 100)
		if aiErr != nil {
			fmt.Printf("AI search call failed, falling back to DB search: %v\n", aiErr)
			useAISearch = false
		} else if len(aiIDs) == 0 {
			response := models.PaginatedProductsResponse{
				Products:   []models.Product{},
				TotalPages: 0,
				Page:       page,
			}
			utils.RespondWithJSON(w, http.StatusOK, response)
			return
		} else {
			aiProductIDs = aiIDs
			conditions = append(conditions, fmt.Sprintf("p.id = ANY($%d)", argId))
			args = append(args, pq.Array(aiProductIDs))
			argId++
		}
	}
	// === KẾT THÚC LOGIC AI SEARCH ===

	// Điều kiện tìm kiếm DB thông thường (chỉ áp dụng nếu không dùng AI search hoặc AI bị lỗi)
	if !useAISearch && searchQuery != "" {
		conditions = append(conditions, "p.name ILIKE '%' || $"+strconv.Itoa(argId)+" || '%'")
		args = append(args, searchQuery)
		argId++
	}

	// Điều kiện lọc category (luôn áp dụng)
	if categoryQuery != "" {
		conditions = append(conditions, "c.slug = $"+strconv.Itoa(argId))
		args = append(args, categoryQuery)
		argId++
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = " WHERE " + strings.Join(conditions, " AND ")
	}

	countQuery := "SELECT COUNT(p.id) FROM products p LEFT JOIN categories c ON p.category_id = c.id" + whereClause
	var totalRecords int
	err = h.db.QueryRow(countQuery, args...).Scan(&totalRecords)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi khi đếm sản phẩm")
		return
	}

	totalPages := int(math.Ceil(float64(totalRecords) / float64(limit)))

	// Xây dựng câu query chính
	queryBase := `
        SELECT p.id, p.name, p.price, p.image, p.slug, p.description, p.details, p.quantity,
               p.category_id, p.calories, p.protein_grams, p.carb_grams, p.fat_grams
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id` + whereClause

	var query string
	var finalArgs []interface{}

	if useAISearch && len(aiProductIDs) > 0 {
		// Nếu dùng AI, cần sắp xếp theo thứ tự ID trả về từ AI và phân trang thủ công
		query = queryBase // Query không cần LIMIT OFFSET nữa
		finalArgs = args
	} else {
		// Nếu tìm kiếm thường hoặc AI lỗi, dùng LIMIT OFFSET
		query = queryBase + ` ORDER BY p.created_at DESC LIMIT $` + strconv.Itoa(argId) + ` OFFSET $` + strconv.Itoa(argId+1)
		finalArgs = append(args, limit, offset)
		argId += 2 // Tăng argId cho LIMIT và OFFSET
	}

	rows, err := h.db.Query(query, finalArgs...)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi truy vấn sản phẩm")
		return
	}
	defer rows.Close()

	productsMap := make(map[int]models.Product)
	var productsList []models.Product // List để dùng cho trường hợp ko sort AI
	for rows.Next() {
		var np models.NullableProduct
		if err := rows.Scan(&np.ID, &np.Name, &np.Price, &np.Image, &np.Slug, &np.Description, &np.Details, &np.Quantity, &np.CategoryID, &np.Calories, &np.ProteinGrams, &np.CarbGrams, &np.FatGrams); err != nil {
			utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi quét dữ liệu sản phẩm")
			return
		}
		p := models.Product{ // Chuyển đổi từ NullableProduct sang Product
			ID:          np.ID,
			Name:        np.Name,
			Price:       np.Price,
			Image:       np.Image.String,
			Slug:        np.Slug,
			Description: np.Description.String,
			Details:     np.Details.String,
			Quantity:    np.Quantity,
		}
		if np.CategoryID.Valid { categoryID := int(np.CategoryID.Int64); p.CategoryID = &categoryID }
		if np.Calories.Valid { p.Calories = int(np.Calories.Int64) }
		if np.ProteinGrams.Valid { p.ProteinGrams = int(np.ProteinGrams.Int64) }
		if np.CarbGrams.Valid { p.CarbGrams = int(np.CarbGrams.Int64) }
		if np.FatGrams.Valid { p.FatGrams = int(np.FatGrams.Int64) }
		productsMap[p.ID] = p
		productsList = append(productsList, p)
	}

	var finalProducts []models.Product
	if useAISearch && len(aiProductIDs) > 0 {
		// Sắp xếp và phân trang thủ công theo kết quả AI
		tempProducts := make([]models.Product, 0, len(aiProductIDs))
		for _, id := range aiProductIDs {
			if product, ok := productsMap[id]; ok {
				tempProducts = append(tempProducts, product)
			}
		}
		// Áp dụng phân trang
		start := offset
		end := offset + limit
		if start >= len(tempProducts) {
			finalProducts = []models.Product{}
		} else {
			if end > len(tempProducts) {
				end = len(tempProducts)
			}
			finalProducts = tempProducts[start:end]
		}
		// Cập nhật lại totalRecords và totalPages dựa trên kết quả AI
		totalRecords = len(tempProducts)
		totalPages = int(math.Ceil(float64(totalRecords) / float64(limit)))

	} else {
		// Sử dụng kết quả query trực tiếp (đã có LIMIT OFFSET)
		finalProducts = productsList
	}


	response := models.PaginatedProductsResponse{
		Products:   finalProducts,
		TotalPages: totalPages,
		Page:       page,
	}
	utils.RespondWithJSON(w, http.StatusOK, response)
}

func (h *handler) getProductBySlug(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    slug := vars["slug"]

    var np models.NullableProduct
    err := h.db.QueryRow(`
        SELECT id, name, price, image, slug, description, details, quantity,
               category_id, calories, protein_grams, carb_grams, fat_grams
        FROM products WHERE slug = $1`, slug).Scan(&np.ID, &np.Name, &np.Price, &np.Image, &np.Slug, &np.Description, &np.Details, &np.Quantity, &np.CategoryID, &np.Calories, &np.ProteinGrams, &np.CarbGrams, &np.FatGrams)

    if err != nil {
        if err == sql.ErrNoRows {
            utils.RespondWithError(w, http.StatusNotFound, "Không tìm thấy sản phẩm")
        } else {
            utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi truy vấn CSDL")
        }
        return
    }

	p := models.Product{
		ID:	         np.ID,
		Name:        np.Name,
		Price:       np.Price,
		Image:       np.Image.String,
		Slug:        np.Slug,
		Description: np.Description.String,
		Details:     np.Details.String,
		Quantity:    np.Quantity,
	}
	if np.CategoryID.Valid {
		categoryID := int(np.CategoryID.Int64)
		p.CategoryID = &categoryID
	}
	if np.Calories.Valid {
		p.Calories = int(np.Calories.Int64)
	}
	if np.ProteinGrams.Valid {
		p.ProteinGrams = int(np.ProteinGrams.Int64)
	}
	if np.CarbGrams.Valid {
		p.CarbGrams = int(np.CarbGrams.Int64)
	}
	if np.FatGrams.Valid {
		p.FatGrams = int(np.FatGrams.Int64)
	}

    utils.RespondWithJSON(w, http.StatusOK, p)
}

func (h *handler) createOrder(w http.ResponseWriter, r *http.Request) {
    var req models.CreateOrderRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        utils.RespondWithError(w, http.StatusBadRequest, "Dữ liệu không hợp lệ")
        return
    }

    // Validate request
    if len(req.CartItems) == 0 {
        utils.RespondWithError(w, http.StatusBadRequest, "Giỏ hàng trống")
        return
    }

    tx, err := h.db.Begin()
    if err != nil {
        utils.RespondWithError(w, http.StatusInternalServerError, "Không thể bắt đầu transaction")
        return
    }
    defer tx.Rollback()

    var totalAmount int64
    productPrices := make(map[int]int64)

    // Check product availability and prices
    for _, item := range req.CartItems {
        var price int64
        var availableQuantity int
        err := tx.QueryRow("SELECT price, quantity FROM products WHERE id = $1", item.ProductID).
            Scan(&price, &availableQuantity)
        if err != nil {
            if err == sql.ErrNoRows {
                utils.RespondWithError(w, http.StatusBadRequest, "Sản phẩm không tồn tại: ID "+strconv.Itoa(item.ProductID))
                return
            }
            utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi khi kiểm tra sản phẩm")
            return
        }

        if availableQuantity < item.Quantity {
            utils.RespondWithError(w, http.StatusBadRequest,
                fmt.Sprintf("Sản phẩm ID %d chỉ còn %d sản phẩm", item.ProductID, availableQuantity))
            return
        }

        totalAmount += price * int64(item.Quantity)
        productPrices[item.ProductID] = price
    }

    var discountAmount int64 = 0
    if req.AppliedUserVoucherID != nil {
        var uv models.UserVoucher
        var v models.Voucher

        err := tx.QueryRow(`
            SELECT uv.is_used, uv.expires_at, v.discount_type, v.discount_value
            FROM user_vouchers uv
            JOIN vouchers v ON uv.voucher_id = v.id
            WHERE uv.id = $1 AND uv.user_id = $2 FOR UPDATE
        `, *req.AppliedUserVoucherID, req.UserID).Scan(&uv.IsUsed, &uv.ExpiresAt, &v.DiscountType, &v.DiscountValue)

        if err != nil {
            if err == sql.ErrNoRows {
                utils.RespondWithError(w, http.StatusBadRequest, "Voucher không tồn tại hoặc không thuộc về bạn")
                return
            }
            utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi khi kiểm tra voucher")
            return
        }

        if uv.IsUsed {
            utils.RespondWithError(w, http.StatusBadRequest, "Voucher này đã được sử dụng")
            return
        }

        if time.Now().UTC().After(uv.ExpiresAt) {
            utils.RespondWithError(w, http.StatusBadRequest, "Voucher đã hết hạn")
            return
        }

        if v.DiscountType == "percentage" {
            discountAmount = (totalAmount * v.DiscountValue) / 100
        } else if v.DiscountType == "fixed_amount" {
            discountAmount = v.DiscountValue
        }

        if discountAmount > totalAmount {
            discountAmount = totalAmount
        }
    }

    finalAmount := totalAmount - discountAmount

    var orderID int
    err = tx.QueryRow(`
        INSERT INTO orders (
            user_id, customer_name, customer_phone, shipping_address,
            total_amount, status, applied_voucher_id, discount_amount
        ) VALUES ($1, $2, $3, $4, $5, 'pending', $6, $7)
        RETURNING id`,
        req.UserID, req.CustomerName, req.CustomerPhone,
        req.ShippingAddress, finalAmount, req.AppliedUserVoucherID,
        discountAmount,
    ).Scan(&orderID)

    if err != nil {
        utils.RespondWithError(w, http.StatusInternalServerError, "Không thể tạo đơn hàng")
        return
    }

    // Insert order items and update product quantities
    for _, item := range req.CartItems {
        _, err = tx.Exec(`
            INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
            VALUES ($1, $2, $3, $4)`,
            orderID, item.ProductID, item.Quantity, productPrices[item.ProductID],
        )
        if err != nil {
            utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi khi thêm chi tiết đơn hàng")
            return
        }
    }

    // Mark voucher as used
    if req.AppliedUserVoucherID != nil {
        _, err := tx.Exec(
            "UPDATE user_vouchers SET is_used = true WHERE id = $1",
            *req.AppliedUserVoucherID,
        )
        if err != nil {
            utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi khi cập nhật trạng thái voucher")
            return
        }
    }

	if req.UserID != nil {
		_, err = tx.Exec("DELETE FROM carts WHERE user_id = $1", *req.UserID)
		if err != nil {
			utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi khi dọn dẹp giỏ hàng")
			return
		}
	}

    if err := tx.Commit(); err != nil {
        utils.RespondWithError(w, http.StatusInternalServerError, "Không thể hoàn tất đơn hàng")
        return
    }

    utils.RespondWithJSON(w, http.StatusCreated, map[string]interface{}{
        "order_id": orderID,
        "message": "Đặt hàng thành công",
    })
}
