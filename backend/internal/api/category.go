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

func (h *handler) getCategories(w http.ResponseWriter, r *http.Request) {
	page, limit, offset := utils.GetPaginationParams(r, 10)

	var totalRecords int
	h.db.QueryRow("SELECT COUNT(*) FROM categories").Scan(&totalRecords)
	totalPages := int(math.Ceil(float64(totalRecords) / float64(limit)))

	rows, err := h.db.Query("SELECT id, name, slug FROM categories ORDER BY name LIMIT $1 OFFSET $2", limit, offset)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi truy vấn danh mục")
		return
	}
	defer rows.Close()

	var categories []models.Category
	for rows.Next() {
		var c models.Category
		if err := rows.Scan(&c.ID, &c.Name, &c.Slug); err != nil {
			utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi quét dữ liệu")
			return
		}
		categories = append(categories, c)
	}
	response := models.PaginatedCategoriesResponse{
		Categories: categories,
		TotalPages: totalPages,
		Page:       page,
	}
	utils.RespondWithJSON(w, http.StatusOK, response)
}

func (h *handler) createCategory(w http.ResponseWriter, r *http.Request) {
	var c models.Category
	if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Dữ liệu không hợp lệ")
		return
	}

	err := h.db.QueryRow(
		"INSERT INTO categories (name, slug) VALUES ($1, $2) RETURNING id",
		c.Name, c.Slug,
	).Scan(&c.ID)

	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi khi tạo danh mục, có thể slug đã tồn tại")
		return
	}
	utils.RespondWithJSON(w, http.StatusCreated, c)
}

func (h *handler) updateCategory(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.Atoi(mux.Vars(r)["id"])
	var c models.Category
	if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Dữ liệu không hợp lệ")
		return
	}

	_, err := h.db.Exec(
		"UPDATE categories SET name = $1, slug = $2 WHERE id = $3",
		c.Name, c.Slug, id,
	)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi khi cập nhật danh mục")
		return
	}
	utils.RespondWithJSON(w, http.StatusOK, c)
}

func (h *handler) deleteCategory(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.Atoi(mux.Vars(r)["id"])

	_, err := h.db.Exec("UPDATE products SET category_id = NULL WHERE category_id = $1", id)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi khi cập nhật sản phẩm liên quan")
		return
	}

	_, err = h.db.Exec("DELETE FROM categories WHERE id = $1", id)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi khi xóa danh mục")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
