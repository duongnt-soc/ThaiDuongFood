package api

import (
	"encoding/json"
	"log"
	"net/http"
	"backend/internal/ai"
	"backend/internal/models"
	"backend/internal/utils"
)

func (h *handler) analyzeConversation(w http.ResponseWriter, r *http.Request) {
	var req models.ChatbotRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	var productsInCart []models.Product
	if len(req.CartItems) > 0 {
		for _, item := range req.CartItems {
			var p models.Product
			err := h.db.QueryRow("SELECT id, name, calories, protein_grams, carb_grams, fat_grams FROM products WHERE id = $1", item.ProductID).Scan(&p.ID, &p.Name, &p.Calories, &p.ProteinGrams, &p.CarbGrams, &p.FatGrams)
			if err == nil {
				productsInCart = append(productsInCart, p)
			}
		}
	}
	
	var allProducts []models.Product
	rows, err := h.db.Query("SELECT id, name, description, calories, price FROM products WHERE quantity > 0")
	if err == nil {
		for rows.Next() {
			var p models.Product
			rows.Scan(&p.ID, &p.Name, &p.Description, &p.Calories, &p.Price)
			allProducts = append(allProducts, p)
		}
		rows.Close()
	}

	responseMessage, err := ai.GetGenerativeResponse(req, productsInCart, allProducts)
	if err != nil {
		log.Printf("Gemini API error: %v", err)
		utils.RespondWithError(w, http.StatusInternalServerError, "The AI assistant is currently unavailable.")
		return
	}
	
	utils.RespondWithJSON(w, http.StatusOK, models.ChatbotResponse{Message: responseMessage})
}