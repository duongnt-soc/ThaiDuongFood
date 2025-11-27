package api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"os"
	"backend/internal/models"
	"backend/internal/utils"

	"github.com/gorilla/mux"
	"github.com/lib/pq" // Import thư viện pq để xử lý mảng ID
)

// === AI Service Communication ===
var aiMLServiceURL = os.Getenv("AI_SERVICE_URL")

// Hàm gọi dịch vụ AI Python (ví dụ cho search)
func callAISearch(query string, limit int) ([]int, error) {
	aiReqBody, _ := json.Marshal(map[string]interface{}{
		"text":  query,
		"limit": limit,
	})
	if aiMLServiceURL == "" {
		aiMLServiceURL = "http://localhost:8001" 
	}
	resp, err := http.Post(fmt.Sprintf("%s/search", aiMLServiceURL), "application/json", bytes.NewBuffer(aiReqBody))
	if err != nil {
		return nil, fmt.Errorf("lỗi khi gọi AI search service: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		var errResp map[string]string
		if json.NewDecoder(resp.Body).Decode(&errResp) == nil {
			return nil, fmt.Errorf("AI search service trả về lỗi %d: %s", resp.StatusCode, errResp["detail"])
		}
		return nil, fmt.Errorf("AI search service trả về lỗi %d", resp.StatusCode)
	}

	var productIDs []int
	if err := json.NewDecoder(resp.Body).Decode(&productIDs); err != nil {
		return nil, fmt.Errorf("lỗi khi đọc kết quả từ AI search service: %w", err)
	}
	return productIDs, nil
}

// Hàm gọi dịch vụ AI Python (ví dụ cho related products)
func callAIRelated(productID int, limit int) ([]int, error) {
	resp, err := http.Get(fmt.Sprintf("%s/related-products/%d?limit=%d", aiMLServiceURL, productID, limit))
	if err != nil {
		return nil, fmt.Errorf("lỗi khi gọi AI related service: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		var errResp map[string]string
		if json.NewDecoder(resp.Body).Decode(&errResp) == nil {
			return nil, fmt.Errorf("AI related service trả về lỗi %d: %s", resp.StatusCode, errResp["detail"])
		}
		return nil, fmt.Errorf("AI related service trả về lỗi %d", resp.StatusCode)
	}

	var productIDs []int
	if err := json.NewDecoder(resp.Body).Decode(&productIDs); err != nil {
		return nil, fmt.Errorf("lỗi khi đọc kết quả từ AI related service: %w", err)
	}
	return productIDs, nil
}

// Handler mới cho /api/search
func (h *handler) searchProductsAI(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q") // Lấy query từ param 'q'
	limitStr := r.URL.Query().Get("limit")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 10 // Giá trị mặc định
	}

	if query == "" {
		utils.RespondWithError(w, http.StatusBadRequest, "Thiếu query parameter 'q'")
		return
	}

	productIDs, err := callAISearch(query, limit)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Lỗi tìm kiếm AI: %v", err))
		return
	}

	if len(productIDs) == 0 {
		utils.RespondWithJSON(w, http.StatusOK, []models.Product{}) // Trả về mảng rỗng nếu không có kết quả
		return
	}

	// --- Lấy thông tin chi tiết sản phẩm từ DB dựa trên IDs ---
	queryStmt := `
        SELECT p.id, p.name, p.price, p.image, p.slug, p.description, p.details, p.quantity,
               p.category_id, p.calories, p.protein_grams, p.carb_grams, p.fat_grams
        FROM products p
        WHERE p.id = ANY($1)
    `
	rows, err := h.db.Query(queryStmt, pq.Array(productIDs))
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi truy vấn sản phẩm sau khi tìm kiếm AI")
		return
	}
	defer rows.Close()

	productsMap := make(map[int]models.Product) // Dùng map để giữ đúng thứ tự từ AI
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
		productsMap[p.ID] = p
	}

	// Sắp xếp lại kết quả theo thứ tự trả về từ AI
	sortedProducts := make([]models.Product, 0, len(productIDs))
	for _, id := range productIDs {
		if product, ok := productsMap[id]; ok {
			sortedProducts = append(sortedProducts, product)
		}
	}

	utils.RespondWithJSON(w, http.StatusOK, sortedProducts)
}

// Handler mới cho /api/products/{id}/related
func (h *handler) getRelatedProductsAI(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	productID, err := strconv.Atoi(vars["id"])
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "ID sản phẩm không hợp lệ")
		return
	}

	limitStr := r.URL.Query().Get("limit")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 5 // Giá trị mặc định
	}

	relatedIDs, err := callAIRelated(productID, limit)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, fmt.Sprintf("Lỗi lấy sản phẩm liên quan AI: %v", err))
		return
	}

	if len(relatedIDs) == 0 {
		utils.RespondWithJSON(w, http.StatusOK, []models.Product{})
		return
	}

	// --- Lấy thông tin chi tiết sản phẩm từ DB dựa trên IDs ---
	queryStmt := `
        SELECT p.id, p.name, p.price, p.image, p.slug, p.description, p.details, p.quantity,
               p.category_id, p.calories, p.protein_grams, p.carb_grams, p.fat_grams
        FROM products p
        WHERE p.id = ANY($1)
    `
	rows, err := h.db.Query(queryStmt, pq.Array(relatedIDs))
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi truy vấn sản phẩm liên quan")
		return
	}
	defer rows.Close()

	productsMap := make(map[int]models.Product)
	for rows.Next() {
		var np models.NullableProduct
		if err := rows.Scan(&np.ID, &np.Name, &np.Price, &np.Image, &np.Slug, &np.Description, &np.Details, &np.Quantity, &np.CategoryID, &np.Calories, &np.ProteinGrams, &np.CarbGrams, &np.FatGrams); err != nil {
			utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi quét dữ liệu sản phẩm liên quan")
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
		productsMap[p.ID] = p
	}

	sortedProducts := make([]models.Product, 0, len(relatedIDs))
	for _, id := range relatedIDs {
		if product, ok := productsMap[id]; ok {
			sortedProducts = append(sortedProducts, product)
		}
	}

	utils.RespondWithJSON(w, http.StatusOK, sortedProducts)
}
