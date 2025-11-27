package api

import (
	"database/sql"
	"net/http"
	"backend/internal/models"
	"backend/internal/utils"
	"strconv"
	
	"github.com/gorilla/mux"
)

func (h *handler) getUserOrders(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(int)
	if !ok {
		utils.RespondWithError(w, http.StatusInternalServerError, "Could not retrieve user ID from context")
		return
	}

	rows, err := h.db.Query(`
        SELECT id, customer_name, total_amount, status, created_at
        FROM orders
        WHERE user_id = $1
        ORDER BY created_at DESC
    `, userID)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi truy vấn đơn hàng")
		return
	}
	defer rows.Close()

	orders := []models.Order{}
	for rows.Next() {
		var o models.Order
		if err := rows.Scan(&o.ID, &o.CustomerName, &o.TotalAmount, &o.Status, &o.CreatedAt); err != nil {
			utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi quét dữ liệu đơn hàng")
			return
		}
		orders = append(orders, o)
	}
	utils.RespondWithJSON(w, http.StatusOK, orders)
}

func (h *handler) getOrderDetails(w http.ResponseWriter, r *http.Request) {
	userID, _ := r.Context().Value("userID").(int)
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
        WHERE id = $1 AND user_id = $2
    `, orderID, userID).Scan(&order.ID, &order.CustomerName, &order.CustomerPhone, &order.ShippingAddress, &order.TotalAmount, &order.Status, &order.CreatedAt)

	if err != nil {
		if err == sql.ErrNoRows {
			utils.RespondWithError(w, http.StatusNotFound, "Order not found or you do not have permission to view it")
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