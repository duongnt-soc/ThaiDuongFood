package api

import (
	"encoding/json"
	"net/http"
	"strconv"
	"math"
	"backend/internal/models"
	"backend/internal/utils"
	"github.com/gorilla/mux"
)

func (h *handler) getReviews(w http.ResponseWriter, r *http.Request) {
	productID, _ := strconv.Atoi(mux.Vars(r)["id"])

	rows, err := h.db.Query(`
        SELECT r.id, r.user_id, r.rating, r.comment, r.created_at, r.admin_reply, u.username
        FROM product_reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.product_id = $1
        ORDER BY r.created_at DESC
    `, productID)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi truy vấn đánh giá")
		return
	}
	defer rows.Close()

	var reviews []models.ProductReview
	for rows.Next() {
		var review models.ProductReview
		if err := rows.Scan(&review.ID, &review.UserID, &review.Rating, &review.Comment, &review.CreatedAt, &review.AdminReply, &review.Username); err != nil { /* ... */ }
		reviews = append(reviews, review)
	}
	utils.RespondWithJSON(w, http.StatusOK, reviews)
}

func (h *handler) createReview(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(int)
	productID, _ := strconv.Atoi(mux.Vars(r)["id"])

	var payload struct {
		Rating  int    `json:"rating"`
		Comment string `json:"comment"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Dữ liệu không hợp lệ")
		return
	}

	var newReview models.ProductReview
	err := h.db.QueryRow(`
        INSERT INTO product_reviews (product_id, user_id, rating, comment)
        VALUES ($1, $2, $3, $4)
        RETURNING id, rating, comment, created_at
    `, productID, userID, payload.Rating, payload.Comment).Scan(&newReview.ID, &newReview.Rating, &newReview.Comment, &newReview.CreatedAt)

	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Không thể gửi đánh giá. Có thể bạn đã đánh giá sản phẩm này rồi.")
		return
	}

	utils.RespondWithJSON(w, http.StatusCreated, newReview)
}

func (h *handler) updateReview(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(int)
	reviewID, _ := strconv.Atoi(mux.Vars(r)["reviewId"])

	var payload struct {
		Rating  int    `json:"rating"`
		Comment string `json:"comment"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil { /* ... */ }

	res, err := h.db.Exec(`
        UPDATE product_reviews SET rating = $1, comment = $2
        WHERE id = $3 AND user_id = $4
    `, payload.Rating, payload.Comment, reviewID, userID)
	if err != nil { /* ... */ }

	rowsAffected, _ := res.RowsAffected()
	if rowsAffected == 0 {
		utils.RespondWithError(w, http.StatusForbidden, "Bạn chỉ có thể chỉnh đánh giá của.")
		return
	}
	utils.RespondWithJSON(w, http.StatusOK, map[string]string{"message": "Review updated"})
}

func (h *handler) adminGetAllReviews(w http.ResponseWriter, r *http.Request) {
	page, limit, offset := utils.GetPaginationParams(r, 10)

	var totalRecords int
	h.db.QueryRow("SELECT COUNT(*) FROM product_reviews").Scan(&totalRecords)
	totalPages := int(math.Ceil(float64(totalRecords) / float64(limit)))

	rows, err := h.db.Query(`
        SELECT r.id, p.name, u.username, r.rating, r.comment, r.admin_reply, r.created_at
        FROM product_reviews r
        JOIN users u ON r.user_id = u.id
        JOIN products p ON r.product_id = p.id
        ORDER BY r.created_at DESC
        LIMIT $1 OFFSET $2
    `, limit, offset)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi truy vấn đánh giá")
		return
	}
	defer rows.Close()

	var reviews []models.ProductReview
	for rows.Next() {
		var review models.ProductReview
		if err := rows.Scan(&review.ID, &review.ProductName, &review.Username, &review.Rating, &review.Comment, &review.AdminReply, &review.CreatedAt); err != nil {
			utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi quét dữ liệu đánh giá")
			return
		}
		reviews = append(reviews, review)
	}

	response := models.PaginatedReviewsResponse{
		Reviews:    reviews,
		TotalPages: totalPages,
		Page:       page,
	}
	utils.RespondWithJSON(w, http.StatusOK, response)
}

func (h *handler) adminDeleteReview(w http.ResponseWriter, r *http.Request) {
	reviewID, _ := strconv.Atoi(mux.Vars(r)["reviewId"])
	_, err := h.db.Exec("DELETE FROM product_reviews WHERE id = $1", reviewID)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi khi xóa đánh giá")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
