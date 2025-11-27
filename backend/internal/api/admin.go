package api

import (
	"backend/internal/models"
	"backend/internal/utils"
	"database/sql"
	"encoding/json"
	"math"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

func (h *handler) createProduct(w http.ResponseWriter, r *http.Request) {
	var payload models.ProductPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Dữ liệu không hợp lệ")
		return
	}

	var productID int
	err := h.db.QueryRow(
		`INSERT INTO products (name, price, image, slug, description, details, quantity, category_id, calories, protein_grams, carb_grams, fat_grams)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`,
		payload.Name, payload.Price, payload.Image, payload.Slug, payload.Description, payload.Details, payload.Quantity,
		payload.CategoryID, payload.Calories, payload.ProteinGrams, payload.CarbGrams, payload.FatGrams,
	).Scan(&productID)

	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi khi tạo sản phẩm")
		return
	}

	utils.RespondWithJSON(w, http.StatusCreated, map[string]int{"id": productID})
}

func (h *handler) getProductByID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "ID không hợp lệ")
		return
	}

	var p models.Product
	err = h.db.QueryRow("SELECT id, name, price, image, slug, description, details FROM products WHERE id = $1", id).Scan(&p.ID, &p.Name, &p.Price, &p.Image, &p.Slug, &p.Description, &p.Details)
	if err != nil {
		if err == sql.ErrNoRows {
			utils.RespondWithError(w, http.StatusNotFound, "Không tìm thấy sản phẩm")
		} else {
			utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi CSDL")
		}
		return
	}
	utils.RespondWithJSON(w, http.StatusOK, p)
}

func (h *handler) updateProduct(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    id, err := strconv.Atoi(vars["id"])
    if err != nil {
        utils.RespondWithError(w, http.StatusBadRequest, "ID không hợp lệ")
        return
    }

    var payload models.ProductPayload
    if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
        utils.RespondWithError(w, http.StatusBadRequest, "Dữ liệu không hợp lệ")
        return
    }

    _, err = h.db.Exec(
        `UPDATE products SET
         name=$1, price=$2, image=$3, slug=$4, description=$5, details=$6, quantity=$7,
         category_id=$8, calories=$9, protein_grams=$10, carb_grams=$11, fat_grams=$12
         WHERE id=$13`,
        payload.Name, payload.Price, payload.Image, payload.Slug, payload.Description, payload.Details, payload.Quantity,
		payload.CategoryID, payload.Calories, payload.ProteinGrams, payload.CarbGrams, payload.FatGrams,
		id,
    )
    if err != nil {
        utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi khi cập nhật sản phẩm")
        return
    }

    utils.RespondWithJSON(w, http.StatusOK, map[string]string{"message": "Cập nhật thành công"})
}

func (h *handler) deleteProduct(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    id, err := strconv.Atoi(vars["id"])
    if err != nil {
        utils.RespondWithError(w, http.StatusBadRequest, "ID không hợp lệ")
        return
    }

    res, err := h.db.Exec("DELETE FROM products WHERE id=$1", id)
    if err != nil {
        utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi khi xóa sản phẩm")
        return
    }

    rowsAffected, _ := res.RowsAffected()
    if rowsAffected == 0 {
        utils.RespondWithError(w, http.StatusNotFound, "Không tìm thấy sản phẩm để xóa")
        return
    }

    utils.RespondWithJSON(w, http.StatusOK, map[string]string{"result": "success"})
}

func (h *handler) getAllOrders(w http.ResponseWriter, r *http.Request) {
	page, limit, offset := utils.GetPaginationParams(r, 10)

	var totalRecords int
	h.db.QueryRow("SELECT COUNT(*) FROM orders").Scan(&totalRecords)
	totalPages := int(math.Ceil(float64(totalRecords) / float64(limit)))

    rows, err := h.db.Query(`
        SELECT o.id, o.customer_name, o.customer_phone, o.shipping_address, o.total_amount, o.status, o.created_at, u.username
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
		LIMIT $1 OFFSET $2
    `, limit, offset)

    if err != nil {
        utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi truy vấn đơn hàng")
        return
    }
    defer rows.Close()

    orders := []models.Order{}
    for rows.Next() {
        var o models.Order
        var username sql.NullString
        if err := rows.Scan(&o.ID, &o.CustomerName, &o.CustomerPhone, &o.ShippingAddress, &o.TotalAmount, &o.Status, &o.CreatedAt, &username); err != nil {
            utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi quét dữ liệu đơn hàng")
            return
        }
        if username.Valid {
            o.Username = username.String
        } else {
            o.Username = "Guest"
        }
        orders = append(orders, o)
    }

	response := models.PaginatedOrdersResponse{
		Orders:     orders,
		TotalPages: totalPages,
		Page:       page,
	}
	utils.RespondWithJSON(w, http.StatusOK, response)
}

func (h *handler) updateOrderStatus(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	orderID, _ := strconv.Atoi(vars["id"])
	var payload struct {
		Status string `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Dữ liệu không hợp lệ")
		return
	}

	tx, err := h.db.Begin()
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi khi bắt đầu transaction")
		return
	}
	defer tx.Rollback()

	// Lấy trạng thái cũ của đơn hàng
	var oldStatus string
	err = tx.QueryRow("SELECT status FROM orders WHERE id = $1 FOR UPDATE", orderID).Scan(&oldStatus)
	if err != nil {
		utils.RespondWithError(w, http.StatusNotFound, "Không tìm thấy đơn hàng")
		return
	}

	// Lấy danh sách sản phẩm trong đơn hàng
	rows, err := tx.Query("SELECT product_id, quantity FROM order_items WHERE order_id = $1", orderID)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi khi lấy chi tiết đơn hàng")
		return
	}
	defer rows.Close()

	var items []struct {
		ProductID int
		Quantity  int
	}
	for rows.Next() {
		var item struct {
			ProductID int
			Quantity  int
		}
		rows.Scan(&item.ProductID, &item.Quantity)
		items = append(items, item)
	}

	// Xác định trạng thái ĐÃ TRỪ KHO: chỉ shipped và completed
	isNowDeducted := payload.Status == "shipped" || payload.Status == "completed"
	wasAlreadyDeducted := oldStatus == "shipped" || oldStatus == "completed"

	// CASE 1: TRỪ KHO - Khi chuyển sang shipped hoặc completed (và chưa từng bị trừ kho)
	if isNowDeducted && !wasAlreadyDeducted {
		for _, item := range items {
			res, err := tx.Exec(
				"UPDATE products SET quantity = quantity - $1 WHERE id = $2 AND quantity >= $1",
				item.Quantity, item.ProductID,
			)
			if err != nil {
				utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi khi cập nhật kho")
				return
			}
			rowsAffected, _ := res.RowsAffected()
			if rowsAffected == 0 {
				utils.RespondWithError(w, http.StatusBadRequest, "Sản phẩm trong kho không đủ")
				return
			}
		}
	}

	// CASE 2: HOÀN KHO - Khi chuyển sang cancelled (và đã từng bị trừ kho)
	if payload.Status == "cancelled" && wasAlreadyDeducted {
		for _, item := range items {
			_, err := tx.Exec(
				"UPDATE products SET quantity = quantity + $1 WHERE id = $2",
				item.Quantity, item.ProductID,
			)
			if err != nil {
				utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi khi hoàn kho")
				return
			}
		}
	}

	// Cập nhật trạng thái đơn hàng
	_, err = tx.Exec("UPDATE orders SET status = $1 WHERE id = $2", payload.Status, orderID)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi khi cập nhật trạng thái đơn hàng")
		return
	}

	if err := tx.Commit(); err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi khi commit transaction")
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, map[string]string{"message": "Cập nhật trạng thái thành công"})
}

func (h *handler) getDashboardStats(w http.ResponseWriter, r *http.Request) {
    var totalRevenue float64
    var totalOrders, totalCustomers, totalProducts, totalCategories int

    h.db.QueryRow("SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status = 'completed'").Scan(&totalRevenue)
    h.db.QueryRow("SELECT COUNT(*) FROM orders").Scan(&totalOrders)
    h.db.QueryRow("SELECT COUNT(*) FROM users WHERE is_admin = false").Scan(&totalCustomers)
    h.db.QueryRow("SELECT COUNT(*) FROM products").Scan(&totalProducts)
    h.db.QueryRow("SELECT COUNT(*) FROM categories").Scan(&totalCategories)

    rows, err := h.db.Query(`
        SELECT
            TO_CHAR(date_series, 'YYYY-MM-DD') AS date,
            COALESCE(SUM(o.total_amount), 0) AS revenue
        FROM
            generate_series(
                (NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date - INTERVAL '6 days',
                (NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date,
                '1 day'
            ) AS date_series
        LEFT JOIN
            orders o ON DATE(o.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh') = date_series.date
                     AND o.status IN ('completed', 'shipped')
        GROUP BY
            date_series
        ORDER BY
            date_series;
    `)
    if err != nil {
        utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi lấy dữ liệu biểu đồ")
        return
    }
    defer rows.Close()

    var dailyRevenue []models.DailyRevenue
    for rows.Next() {
        var dr models.DailyRevenue
        if err := rows.Scan(&dr.Date, &dr.Revenue); err != nil {
            // handle error
        }
        dailyRevenue = append(dailyRevenue, dr)
    }

	rows, err = h.db.Query(`
        SELECT p.name, SUM(oi.quantity) as total_sold
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        JOIN orders o ON oi.order_id = o.id
        WHERE o.status IN ('completed', 'shipped')
        GROUP BY p.name
        ORDER BY total_sold DESC
        LIMIT 5;
    `)
    if err != nil {
        utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi lấy sản phẩm bán chạy")
        return
    }
    defer rows.Close()

    var topProducts []models.TopProduct
    for rows.Next() {
        var tp models.TopProduct
        if err := rows.Scan(&tp.Name, &tp.TotalSold); err != nil {
            utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi quét dữ liệu sản phẩm bán chạy")
            return
        }
        topProducts = append(topProducts, tp)
    }

    rows, err = h.db.Query(`
        SELECT o.customer_name, SUM(o.total_amount) as total_spent
        FROM orders o
        WHERE o.status IN ('completed', 'shipped') AND o.customer_name != ''
        GROUP BY o.customer_name
        ORDER BY total_spent DESC
        LIMIT 5;
    `)
    if err != nil {
        utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi lấy khách hàng thân thiết")
        return
    }
    defer rows.Close()

    var topCustomers []models.TopCustomer
    for rows.Next() {
        var tc models.TopCustomer
        if err := rows.Scan(&tc.Name, &tc.TotalSpent); err != nil {
             utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi quét dữ liệu khách hàng")
             return
        }
        topCustomers = append(topCustomers, tc)
    }

    stats := models.DashboardStats{
        TotalRevenue:    totalRevenue,
        TotalOrders:     totalOrders,
        TotalCustomers:  totalCustomers,
        TotalProducts:   totalProducts,
        TotalCategories: totalCategories,
        DailyRevenue:    dailyRevenue,
		TopProducts:     topProducts,
        TopCustomers:    topCustomers,
    }

    utils.RespondWithJSON(w, http.StatusOK, stats)
}

// Admin: Lấy danh sách tất cả users (có pagination)
func (h *handler) getAllUsers(w http.ResponseWriter, r *http.Request) {
	pageStr := r.URL.Query().Get("page")
	limitStr := r.URL.Query().Get("limit")

	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 10
	}
	offset := (page - 1) * limit

	// Count total
	var totalRecords int
	err = h.db.QueryRow("SELECT COUNT(*) FROM users").Scan(&totalRecords)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi khi đếm users")
		return
	}
	totalPages := int(math.Ceil(float64(totalRecords) / float64(limit)))

	// Get paginated data
	rows, err := h.db.Query(`
		SELECT id, username, email, created_at
		FROM users
		ORDER BY created_at DESC
		LIMIT $1 OFFSET $2
	`, limit, offset)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi khi truy vấn users")
		return
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		var u models.User
		if err := rows.Scan(&u.ID, &u.Username, &u.Email, &u.CreatedAt); err != nil {
			utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi khi quét dữ liệu user")
			return
		}
		users = append(users, u)
	}

	response := map[string]interface{}{
		"users":      users,
		"page":       page,
		"totalPages": totalPages,
	}
	utils.RespondWithJSON(w, http.StatusOK, response)
}

func (h *handler) replyToReview(w http.ResponseWriter, r *http.Request) {
	reviewID, _ := strconv.Atoi(mux.Vars(r)["reviewId"])
	var payload struct {
		Reply string `json:"reply"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil { /* ... */ }

	_, err := h.db.Exec("UPDATE product_reviews SET admin_reply = $1 WHERE id = $2", payload.Reply, reviewID)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Failed to post reply")
		return
	}
	utils.RespondWithJSON(w, http.StatusOK, map[string]string{"message": "Reply posted"})
}

func (h *handler) getAdminOrderDetails(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	orderID, err := strconv.Atoi(vars["id"])
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid order ID")
		return
	}

	var order models.Order
	err = h.db.QueryRow(`
        SELECT id, customer_name, customer_phone, shipping_address, total_amount, status, created_at
        FROM orders
        WHERE id = $1
    `, orderID).Scan(&order.ID, &order.CustomerName, &order.CustomerPhone, &order.ShippingAddress, &order.TotalAmount, &order.Status, &order.CreatedAt)

	if err != nil {
		if err == sql.ErrNoRows {
			utils.RespondWithError(w, http.StatusNotFound, "Order not found")
			return
		}
		utils.RespondWithError(w, http.StatusInternalServerError, "Database error while fetching order")
		return
	}

	rows, err := h.db.Query(`
        SELECT oi.id, oi.product_id, oi.quantity, oi.price_at_purchase, p.name, p.image
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = $1
    `, orderID)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Database error while fetching order items")
		return
	}
	defer rows.Close()

	var items []models.OrderItem
	for rows.Next() {
		var item models.OrderItem
		var productImage sql.NullString
		if err := rows.Scan(&item.ID, &item.ProductID, &item.Quantity, &item.PriceAtPurchase, &item.ProductName, &productImage); err != nil {
			utils.RespondWithError(w, http.StatusInternalServerError, "Error scanning order items")
			return
		}
		item.ProductImage = productImage.String
		items = append(items, item)
	}

	order.Items = items
	utils.RespondWithJSON(w, http.StatusOK, order)
}
