package api

import (
	"encoding/json"
	"net/http"
	"strconv"
	"backend/internal/models"
	"backend/internal/utils"

	"github.com/gorilla/mux"
)

func (h *handler) getCart(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(int)

	rows, err := h.db.Query(`
        SELECT p.id, p.name, p.price, p.image, p.slug, p.description, p.details, p.quantity, c.quantity
        FROM carts c
        JOIN products p ON c.product_id = p.id
        WHERE c.user_id = $1
    `, userID)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi truy vấn giỏ hàng")
		return
	}
	defer rows.Close()

	var cartItems []models.CartItem
	for rows.Next() {
		var item models.CartItem
		if err := rows.Scan(&item.Product.ID, &item.Product.Name, &item.Product.Price, &item.Product.Image, &item.Product.Slug, &item.Product.Description, &item.Product.Details, &item.Product.Quantity, &item.Quantity); err != nil {
			utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi quét dữ liệu giỏ hàng")
			return
		}
		cartItems = append(cartItems, item)
	}
	utils.RespondWithJSON(w, http.StatusOK, cartItems)
}

func (h *handler) addToCart(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(int)
	var req struct {
		ProductID int `json:"product_id"`
		Quantity  int `json:"quantity"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Dữ liệu không hợp lệ")
		return
	}

	query := `
        INSERT INTO carts (user_id, product_id, quantity)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id, product_id)
        DO UPDATE SET quantity = carts.quantity + $3;
    `
	_, err := h.db.Exec(query, userID, req.ProductID, req.Quantity)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi khi thêm vào giỏ hàng")
		return
	}
	utils.RespondWithJSON(w, http.StatusCreated, map[string]string{"message": "Thêm vào giỏ hàng thành công"})
}

func (h *handler) removeFromCart(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(int)
	productID, _ := strconv.Atoi(mux.Vars(r)["productId"])

	_, err := h.db.Exec("DELETE FROM carts WHERE user_id = $1 AND product_id = $2", userID, productID)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi khi xóa sản phẩm")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *handler) updateCartItem(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(int)
	productID, _ := strconv.Atoi(mux.Vars(r)["productId"])

	var req struct {
		Quantity int `json:"quantity"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Dữ liệu không hợp lệ")
		return
	}

	if req.Quantity <= 0 {
		h.removeFromCart(w, r)
		return
	}

	_, err := h.db.Exec(`
        UPDATE carts SET quantity = $1
        WHERE user_id = $2 AND product_id = $3
    `, req.Quantity, userID, productID)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi khi cập nhật giỏ hàng")
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, map[string]string{"message": "Cập nhật số lượng thành công"})
}

func (h *handler) clearUserCart(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(int)

	_, err := h.db.Exec("DELETE FROM carts WHERE user_id = $1", userID)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi khi dọn dẹp giỏ hàng")
		return
	}

	w.WriteHeader(http.StatusNoContent) // Trả về 204 No Content là chuẩn nhất cho
}
