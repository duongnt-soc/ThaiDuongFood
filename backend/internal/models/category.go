package models

type Category struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
	Slug string `json:"slug"`
}

type PaginatedCategoriesResponse struct {
	Categories []Category `json:"categories"`
	TotalPages int        `json:"totalPages"`
	Page       int        `json:"page"`
}