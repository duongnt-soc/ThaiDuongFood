package api

import (
	"database/sql"
	"fmt"
	"net/http"
	"strconv"

	"backend/internal/utils"

	"github.com/gorilla/mux"
)

func (h *handler) getOrderStatus(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	orderIDStr := vars["id"]
	orderID, err := strconv.Atoi(orderIDStr)
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid order ID")
		return
	}

	var status string
	var totalAmount int64
	var customerName string
	err = h.db.QueryRow("SELECT status, total_amount, customer_name FROM orders WHERE id = $1", orderID).Scan(&status, &totalAmount, &customerName)
	if err != nil {
		if err == sql.ErrNoRows {
			utils.RespondWithError(w, http.StatusNotFound, "Order not found")
			return
		}
		fmt.Printf("ERROR fetching order status: %v\n", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Database error")
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, map[string]interface{}{
		"id":            orderID,
		"status":        status,
		"total_amount":  totalAmount,
		"customer_name": customerName,
	})
}
