package api

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"backend/internal/models"
	"backend/internal/utils"
)

func (h *handler) createDemoPayment(w http.ResponseWriter, r *http.Request) {
	var req models.MoMoRequestPayload
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Dữ liệu không hợp lệ")
		return
	}

	if len(req.CartItems) == 0 {
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
				utils.RespondWithError(w, http.StatusBadRequest, "Voucher không tồn tại")
				return
			}
			utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi khi kiểm tra voucher")
			return
		}

		if uv.IsUsed {
			utils.RespondWithError(w, http.StatusBadRequest, "Voucher đã được sử dụng")
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
	) VALUES ($1, $2, $3, $4, $5, 'paid', $6, $7) RETURNING id`

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

		_, err = tx.Exec(`UPDATE products SET quantity = quantity - $1 WHERE id = $2`,
			item.Quantity, item.ProductID,
		)
		if err != nil {
			utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi khi cập nhật số lượng sản phẩm")
			return
		}
	}

	if req.AppliedUserVoucherID != nil {
		_, err := tx.Exec("UPDATE user_vouchers SET is_used = true WHERE id = $1", *req.AppliedUserVoucherID)
		if err != nil {
			utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi khi cập nhật voucher")
			return
		}
	}

	if req.UserID != nil {
		_, err = tx.Exec("DELETE FROM carts WHERE user_id = $1", *req.UserID)
		if err != nil {
			utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi khi xóa giỏ hàng")
			return
		}
	}

	if err := tx.Commit(); err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi khi commit transaction")
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, map[string]interface{}{
		"success":  true,
		"order_id": orderID,
		"message":  "Đặt hàng thành công (Demo mode)",
	})
}
