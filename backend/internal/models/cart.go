package models

type CartItem struct {
	Product  Product `json:"product"`
	Quantity int     `json:"quantity"`
}