package models

type UserProfile struct {
	UserID            int    `json:"user_id,omitempty"`
	HeightCM          *int   `json:"height_cm,omitempty"`
	WeightKG          *int   `json:"weight_kg,omitempty"`
	HealthConditions  *string `json:"health_conditions,omitempty"`
	DietaryPreference *string `json:"dietary_preference,omitempty"`
}

type ChatMessage struct {
	Role    string `json:"role"` 
	Content string `json:"content"`
}

type ChatbotRequest struct {
	CartItems   []CartItemRequest `json:"cart_items"`
	History     []ChatMessage     `json:"history"` 
	UserProfile *UserProfile      `json:"user_profile,omitempty"`
}

type ChatbotResponse struct {
	Message    string    `json:"message"`
	Suggestion *Product  `json:"suggestion,omitempty"`
}