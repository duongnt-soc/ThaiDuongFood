package models

import (
	"database/sql"
	"time"
)

type Product struct {
	ID            int       `json:"id"`
	Name          string    `json:"name"`
	Price         int64     `json:"price,string"`
	Image         string    `json:"image"`
	Slug          string    `json:"slug"`
	Description   string    `json:"description"`
	Details       string    `json:"details"`
	Quantity      int       `json:"quantity"`
	CategoryID    *int      `json:"category_id,omitempty"`
	Calories      int       `json:"calories,omitempty"`
	ProteinGrams  int       `json:"protein_grams,omitempty"`
	CarbGrams     int       `json:"carb_grams,omitempty"`
	FatGrams      int       `json:"fat_grams,omitempty"`     
	CreatedAt     time.Time `json:"created_at"`
}

type ProductPayload struct {
	Name        string  `json:"name"`
	Price       int64   `json:"price"` 
	Quantity    int     `json:"quantity"`
	Image       string  `json:"image"`
	Slug        string  `json:"slug"`
	Description string  `json:"description"`
	Details     string  `json:"details"`
	CategoryID   *int    `json:"category_id"` 
	Calories     int     `json:"calories"`    
	ProteinGrams int     `json:"protein_grams"`
	CarbGrams    int     `json:"carb_grams"`   
	FatGrams     int     `json:"fat_grams"` 
}

type PaginatedProductsResponse struct {
	Products   []Product `json:"products"`
	TotalPages int       `json:"totalPages"`
	Page       int       `json:"page"`
}

type NullableProduct struct {
	ID          int
	Name        string
	Price       int64  
	Image       sql.NullString
	Slug        string
	Description sql.NullString
	Details     sql.NullString
	Quantity    int
	CategoryID   sql.NullInt64 
	Calories     sql.NullInt64
	ProteinGrams sql.NullInt64
	CarbGrams    sql.NullInt64
	FatGrams     sql.NullInt64
}