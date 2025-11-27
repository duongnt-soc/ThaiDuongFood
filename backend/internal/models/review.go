package models

import "time"

type ProductReview struct {
	ID        int       `json:"id"`
	ProductID int       `json:"product_id,omitempty"`
	ProductName  string    `json:"product_name"`
	UserID    int       `json:"user_id,omitempty"`
	Username  string    `json:"username"`
	Rating    int       `json:"rating"`
	Comment   string    `json:"comment"`
	AdminReply  *string   `json:"admin_reply,omitempty"`
	CreatedAt time.Time `json:"created_at"`

}

type PaginatedReviewsResponse struct {
	Reviews    []ProductReview `json:"reviews"`
	TotalPages int             `json:"totalPages"`
	Page       int             `json:"page"`
}
