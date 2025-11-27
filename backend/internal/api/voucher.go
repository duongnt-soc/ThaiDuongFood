package api

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"
	"time"
	"math"

	"backend/internal/models"
	"backend/internal/utils"

	"github.com/gorilla/mux"
	"github.com/lib/pq"
)

// Admin: Lấy danh sách tất cả các loại voucher đã tạo
func (h *handler) getAllVouchers(w http.ResponseWriter, r *http.Request) {
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
	err = h.db.QueryRow("SELECT COUNT(*) FROM vouchers").Scan(&totalRecords)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi khi đếm vouchers")
		return
	}
	totalPages := int(math.Ceil(float64(totalRecords) / float64(limit)))

	// Get paginated data
	rows, err := h.db.Query(`
		SELECT id, code, description, discount_type, discount_value,
		       hunt_start_time, hunt_end_time, valid_duration_days, applicable_product_ids, created_at
		FROM vouchers
		ORDER BY created_at DESC
		LIMIT $1 OFFSET $2
	`, limit, offset)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi khi truy vấn vouchers")
		return
	}
	defer rows.Close()

	var vouchers []models.Voucher
	for rows.Next() {
		var v models.Voucher
		var productIDs pq.Int32Array
		if err := rows.Scan(&v.ID, &v.Code, &v.Description, &v.DiscountType, &v.DiscountValue, &v.HuntStartTime, &v.HuntEndTime, &v.ValidDurationDays, &productIDs, &v.CreatedAt); err != nil {
			utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi khi quét dữ liệu voucher")
			return
		}
		v.ApplicableProductIDs = (*[]int32)(&productIDs)
		vouchers = append(vouchers, v)
	}

	response := map[string]interface{}{
		"vouchers":   vouchers,
		"page":       page,
		"totalPages": totalPages,
	}
	utils.RespondWithJSON(w, http.StatusOK, response)
}

// Admin: Tạo một loại voucher mới
func (h *handler) createVoucher(w http.ResponseWriter, r *http.Request) {
	var payload models.VoucherPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Dữ liệu không hợp lệ")
		return
	}

	var voucherID int
	err := h.db.QueryRow(`
		INSERT INTO vouchers (code, description, discount_type, discount_value, hunt_start_time, hunt_end_time, valid_duration_days, applicable_product_ids)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id
	`, payload.Code, payload.Description, payload.DiscountType, payload.DiscountValue, payload.HuntStartTime, payload.HuntEndTime, payload.ValidDurationDays, pq.Array(payload.ApplicableProductIDs)).Scan(&voucherID)

	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi khi tạo voucher")
		return
	}
	utils.RespondWithJSON(w, http.StatusCreated, map[string]int{"id": voucherID})
}

// Admin: Cập nhật thông tin voucher
func (h *handler) updateVoucher(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    voucherID, err := strconv.Atoi(vars["id"])
    if err != nil {
        utils.RespondWithError(w, http.StatusBadRequest, "ID voucher không hợp lệ")
        return
    }

    // Decode request body
    var payload models.VoucherPayload
    if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
        utils.RespondWithError(w, http.StatusBadRequest, "Dữ liệu không hợp lệ")
        return
    }

    // Update voucher in database
    result, err := h.db.Exec(`
        UPDATE vouchers
        SET code = $1, description = $2, discount_type = $3, discount_value = $4, hunt_start_time = $5, hunt_end_time = $6, valid_duration_days = $7, applicable_product_ids = $8, updated_at = NOW()
        WHERE id = $9
    `,
        payload.Code, payload.Description, payload.DiscountType, payload.DiscountValue, payload.HuntStartTime, payload.HuntEndTime, payload.ValidDurationDays, pq.Array(payload.ApplicableProductIDs), voucherID,
    )

    if err != nil {
        utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi khi cập nhật voucher")
        return
    }

    // Check if any row was affected
    rowsAffected, err := result.RowsAffected()
    if err != nil {
        utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi khi kiểm tra kết quả cập nhật")
        return
    }

    if rowsAffected == 0 {
        utils.RespondWithError(w, http.StatusNotFound, "Không tìm thấy voucher")
        return
    }

    utils.RespondWithJSON(w, http.StatusOK, map[string]string{
        "message": "Cập nhật voucher thành công",
    })
}

// Admin: Xóa voucher
func (h *handler) deleteVoucher(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    voucherID, err := strconv.Atoi(vars["id"])
    if err != nil {
        utils.RespondWithError(w, http.StatusBadRequest, "ID voucher không hợp lệ")
        return
    }

    tx, err := h.db.Begin()
    if err != nil {
        utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi khi bắt đầu giao dịch")
        return
    }
    defer tx.Rollback()
    _, err = tx.Exec("DELETE FROM user_vouchers WHERE voucher_id = $1", voucherID)
    if err != nil {
        utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi khi xóa voucher người dùng")
        return
    }

    result, err := tx.Exec("DELETE FROM vouchers WHERE id = $1", voucherID)
    if err != nil {
        utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi khi xóa voucher")
        return
    }

    // Check if the voucher existed
    rowsAffected, err := result.RowsAffected()
    if err != nil {
        utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi khi kiểm tra kết quả xóa")
        return
    }
    if rowsAffected == 0 {
        utils.RespondWithError(w, http.StatusNotFound, "Không tìm thấy voucher")
        return
    }
    // Commit the transaction
    if err = tx.Commit(); err != nil {
        utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi khi hoàn tất xóa voucher")
        return
    }

    utils.RespondWithJSON(w, http.StatusOK, map[string]string{
        "message": "Xóa voucher thành công",
    })
}

// User: Lấy danh sách các voucher có thể "săn" (đang trong giờ săn và chưa sở hữu)
func (h *handler) getClaimableVouchers(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(int)
	now := time.Now().UTC()

	rows, err := h.db.Query(`
		SELECT id, code, description, discount_type, discount_value, hunt_start_time, hunt_end_time
		FROM vouchers
		WHERE $1 BETWEEN hunt_start_time AND hunt_end_time
		AND NOT EXISTS (
			SELECT 1 FROM user_vouchers WHERE voucher_id = vouchers.id AND user_id = $2
		)
	`, now, userID)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi khi tìm voucher có thể nhận")
		return
	}
	defer rows.Close()

	var vouchers []models.Voucher
	for rows.Next() {
		var v models.Voucher
		if err := rows.Scan(&v.ID, &v.Code, &v.Description, &v.DiscountType, &v.DiscountValue, &v.HuntStartTime, &v.HuntEndTime); err != nil {
			utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi khi quét dữ liệu voucher")
			return
		}
		vouchers = append(vouchers, v)
	}
	utils.RespondWithJSON(w, http.StatusOK, vouchers)
}

// User: "Săn" một voucher cụ thể
func (h *handler) claimVoucher(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(int)
	voucherID, _ := strconv.Atoi(mux.Vars(r)["id"])

	var validDurationDays int
	err := h.db.QueryRow("SELECT valid_duration_days FROM vouchers WHERE id = $1 AND now() BETWEEN hunt_start_time AND hunt_end_time", voucherID).Scan(&validDurationDays)
	if err != nil {
		if err == sql.ErrNoRows {
			utils.RespondWithError(w, http.StatusNotFound, "Voucher không tồn tại hoặc đã hết hạn săn")
		} else {
			utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi truy vấn voucher")
		}
		return
	}

	expiresAt := time.Now().UTC().AddDate(0, 0, validDurationDays)

	_, err = h.db.Exec(`
		INSERT INTO user_vouchers (user_id, voucher_id, expires_at) VALUES ($1, $2, $3)
		ON CONFLICT (user_id, voucher_id) DO NOTHING
	`, userID, voucherID, expiresAt)

	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Không thể nhận voucher. Có thể bạn đã nhận rồi.")
		return
	}

	utils.RespondWithJSON(w, http.StatusCreated, map[string]string{"message": "Nhận voucher thành công!"})
}

// User: Lấy danh sách tất cả các voucher mình đang sở hữu
func (h *handler) getUserVouchers(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(int)

	// Lấy cả những voucher chưa dùng và đã hết hạn để người dùng xem lại
	showUsed := r.URL.Query().Get("show_used") == "true"

	query := `
		SELECT uv.id, uv.voucher_id, uv.expires_at, uv.is_used,
		       v.code, v.description, v.discount_type, v.discount_value
		FROM user_vouchers uv
		JOIN vouchers v ON uv.voucher_id = v.id
		WHERE uv.user_id = $1
	`
	if !showUsed {
		query += " AND uv.is_used = false AND uv.expires_at > now()"
	}
	query += " ORDER BY uv.expires_at ASC"

	rows, err := h.db.Query(query, userID)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi khi lấy danh sách voucher của bạn")
		return
	}
	defer rows.Close()

	var userVouchers []models.UserVoucher
	for rows.Next() {
		var uv models.UserVoucher
		if err := rows.Scan(&uv.ID, &uv.VoucherID, &uv.ExpiresAt, &uv.IsUsed,
		                   &uv.VoucherInfo.Code, &uv.VoucherInfo.Description, &uv.VoucherInfo.DiscountType, &uv.VoucherInfo.DiscountValue); err != nil {
			utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi khi quét dữ liệu voucher")
			return
		}
		userVouchers = append(userVouchers, uv)
	}
	utils.RespondWithJSON(w, http.StatusOK, userVouchers)
}

// User: Xóa voucher khỏi ví (chỉ xóa được voucher đã dùng hoặc đã hết hạn)
func (h *handler) deleteUserVoucher(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(int)
	userVoucherID, err := strconv.Atoi(mux.Vars(r)["id"])
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "ID voucher không hợp lệ")
		return
	}

	result, err := h.db.Exec(`
		DELETE FROM user_vouchers
		WHERE id = $1 AND user_id = $2 AND (is_used = TRUE OR expires_at < NOW())
	`, userVoucherID, userID)

	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi khi xóa voucher")
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		utils.RespondWithError(w, http.StatusForbidden, "Không thể xóa voucher này. Nó có thể vẫn còn hạn hoặc không thuộc về bạn.")
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, map[string]string{"message": "Đã xóa voucher khỏi ví của bạn."})
}
