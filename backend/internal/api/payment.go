package api

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"backend/internal/models"
	"backend/internal/payment"
	"backend/internal/utils"
)

func (h *handler) createMoMoPayment(w http.ResponseWriter, r *http.Request) {
	var req models.MoMoRequestPayload
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Dữ liệu không hợp lệ")
		return
	}

	fmt.Printf("Received payment request: %+v\n", req)

	if len(req.CartItems) == 0 {
		fmt.Println("ERROR: Cart is empty")
		utils.RespondWithError(w, http.StatusBadRequest, "Giỏ hàng trống")
		return
	}

	tx, err := h.db.Begin()
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi transaction")
		return
	}
	defer tx.Rollback()

	var totalAmount int64
	productPrices := make(map[int]int64)

	for _, item := range req.CartItems {
		var price int64
		var availableQuantity int
		err := tx.QueryRow("SELECT price, quantity FROM products WHERE id = $1", item.ProductID).
			Scan(&price, &availableQuantity)
		if err != nil {
			if err == sql.ErrNoRows {
				fmt.Printf("ERROR: Product not found: ID %d\n", item.ProductID)
				utils.RespondWithError(w, http.StatusBadRequest, "Sản phẩm không tồn tại: ID "+strconv.Itoa(item.ProductID))
				return
			}
			fmt.Printf("ERROR checking product: %v\n", err)
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
	if req.AppliedUserVoucherID != nil && req.UserID != nil {
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
	// Cập nhật câu query để lưu discount
	orderQuery := `INSERT INTO orders (
		user_id, customer_name, customer_phone, shipping_address,
		total_amount, status, applied_voucher_id, discount_amount
	) VALUES ($1, $2, $3, $4, $5, 'pending_payment', $6, $7) RETURNING id`

	err = tx.QueryRow(
		orderQuery,
		req.UserID, req.CustomerName, req.CustomerPhone, req.ShippingAddress,
		finalAmount, // Dùng finalAmount
		req.AppliedUserVoucherID,
		discountAmount,
	).Scan(&orderID)

	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Không thể tạo đơn hàng")
		return
	}

	// Thêm items vào order_items (Quan trọng cho việc hoàn kho nếu thanh toán thất bại)
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

	// Đánh dấu voucher đã sử dụng
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

	// Gọi MoMo với SỐ TIỀN ĐÃ GIẢM
	payURL, err := payment.CreateMoMoPayment(orderID, finalAmount)
	if err != nil {
		// Nếu tạo MoMo thất bại, rollback tất cả (bao gồm cả việc dùng voucher)
		fmt.Printf("ERROR creating MoMo payment: %v\n", err)
		utils.RespondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Lỗi MoMo: %v", err))
		return
	}

	if err := tx.Commit(); err != nil {
		fmt.Printf("ERROR committing transaction: %v\n", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi khi commit transaction")
		return
	}

	fmt.Printf("SUCCESS: Payment URL created: %s\n", payURL)
	utils.RespondWithJSON(w, http.StatusOK, map[string]string{"payUrl": payURL})
}

func (h *handler) handleMoMoIPN(w http.ResponseWriter, r *http.Request) {
	var ipnData map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&ipnData); err != nil {
		fmt.Printf("ERROR decoding IPN: %v\n", err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	fmt.Printf("Received MoMo IPN: %+v\n", ipnData)

	resultCode, _ := ipnData["resultCode"].(float64)
	orderIDStr, _ := ipnData["orderId"].(string)

	var orderID int
	fmt.Sscanf(orderIDStr, "BISTROBLISS_%d_", &orderID)

	tx, err := h.db.Begin()
	if err != nil {
		fmt.Printf("ERROR starting transaction: %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	defer tx.Rollback()

	if resultCode == 0 {
		fmt.Printf("Payment SUCCESS for order: %s (ID: %d)\n", orderIDStr, orderID)

		_, err = tx.Exec("UPDATE orders SET status = 'paid' WHERE id = $1", orderID)
		if err != nil {
			fmt.Printf("ERROR updating order status: %v\n", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		rows, err := tx.Query(`SELECT product_id, quantity FROM order_items WHERE order_id = $1`, orderID)
		if err != nil {
			fmt.Printf("ERROR fetching order items: %v\n", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		for rows.Next() {
			var productID, quantity int
			if err := rows.Scan(&productID, &quantity); err != nil {
				fmt.Printf("ERROR scanning order item: %v\n", err)
				continue
			}
			_, err = tx.Exec(`UPDATE products SET quantity = quantity - $1 WHERE id = $2`, quantity, productID)
			if err != nil {
				fmt.Printf("ERROR updating product quantity: %v\n", err)
			}
		}

		if err := tx.Commit(); err != nil {
			fmt.Printf("ERROR committing transaction: %v\n", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		fmt.Printf("Order %d marked as paid and inventory updated\n", orderID)
	} else {
		fmt.Printf("Payment FAILED for order: %s, code: %.0f\n", orderIDStr, resultCode)

		_, err = tx.Exec("UPDATE orders SET status = 'cancelled' WHERE id = $1", orderID)
		if err != nil {
			fmt.Printf("ERROR updating order status: %v\n", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		_, err = tx.Exec(`
			UPDATE user_vouchers
			SET is_used = false
			WHERE id = (SELECT applied_voucher_id FROM orders WHERE id = $1)
		`, orderID)
		if err != nil {
			fmt.Printf("ERROR restoring voucher: %v\n", err)
		}

		if err := tx.Commit(); err != nil {
			fmt.Printf("ERROR committing transaction: %v\n", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		fmt.Printf("Order %d marked as cancelled and voucher restored\n", orderID)
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *handler) createBankTransferPayment(w http.ResponseWriter, r *http.Request) {
	var req models.MoMoRequestPayload
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Dữ liệu không hợp lệ")
		return
	}

	fmt.Printf("Received bank transfer payment request: %+v\n", req)

	if len(req.CartItems) == 0 {
		fmt.Println("ERROR: Cart is empty")
		utils.RespondWithError(w, http.StatusBadRequest, "Giỏ hàng trống")
		return
	}

	tx, err := h.db.Begin()
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi transaction")
		return
	}
	defer tx.Rollback()

	var totalAmount int64
	productPrices := make(map[int]int64)

	for _, item := range req.CartItems {
		var price int64
		var availableQuantity int
		err := tx.QueryRow("SELECT price, quantity FROM products WHERE id = $1", item.ProductID).
			Scan(&price, &availableQuantity)
		if err != nil {
			if err == sql.ErrNoRows {
				fmt.Printf("ERROR: Product not found: ID %d\n", item.ProductID)
				utils.RespondWithError(w, http.StatusBadRequest, "Sản phẩm không tồn tại: ID "+strconv.Itoa(item.ProductID))
				return
			}
			fmt.Printf("ERROR checking product: %v\n", err)
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
	if req.AppliedUserVoucherID != nil && req.UserID != nil {
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
	orderQuery := `INSERT INTO orders (
		user_id, customer_name, customer_phone, shipping_address,
		total_amount, status, applied_voucher_id, discount_amount
	) VALUES ($1, $2, $3, $4, $5, 'pending_payment', $6, $7) RETURNING id`

	err = tx.QueryRow(
		orderQuery,
		req.UserID, req.CustomerName, req.CustomerPhone, req.ShippingAddress,
		finalAmount,
		req.AppliedUserVoucherID,
		discountAmount,
	).Scan(&orderID)

	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Không thể tạo đơn hàng")
		return
	}

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
		fmt.Printf("ERROR committing transaction: %v\n", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi khi commit transaction")
		return
	}

	fmt.Printf("SUCCESS: Bank transfer order created: %d\n", orderID)
	utils.RespondWithJSON(w, http.StatusOK, map[string]interface{}{
		"orderId": orderID,
		"amount":  finalAmount,
	})
}
