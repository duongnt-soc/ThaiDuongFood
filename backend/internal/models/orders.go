package models

import "time"

type Order struct {
	ID              int         `json:"id"`
	UserID          *int        `json:"user_id,omitempty"`
	Username        string      `json:"username,omitempty"`
	CustomerName    string      `json:"customer_name"`
	CustomerPhone   string      `json:"customer_phone"`
	ShippingAddress string      `json:"shipping_address"`
	TotalAmount     int64       `json:"total_amount"`
	DiscountAmount  int64       `json:"discount_amount"`      
	VoucherCode     string      `json:"voucher_code,omitempty"` 
	Status          string      `json:"status"`
	CreatedAt       time.Time   `json:"created_at"`
	Items           []OrderItem `json:"items,omitempty"`
}

type OrderItem struct {
	ID              int     `json:"id"`
	OrderID         int     `json:"order_id"`
	ProductID       int     `json:"product_id"`
	ProductName     string  `json:"product_name"`
	ProductImage    string  `json:"product_image"`
	Quantity        int     `json:"quantity"`
	PriceAtPurchase int64   `json:"price_at_purchase"`
}

type CreateOrderRequest struct {
	UserID          *int               `json:"user_id"`
	CustomerName    string             `json:"customer_name"`
	CustomerPhone   string             `json:"customer_phone"`
	ShippingAddress string             `json:"shipping_address"`
	CartItems       []CartItemRequest  `json:"cart_items"`
	AppliedUserVoucherID *int              `json:"applied_user_voucher_id"`
}

type CartItemRequest struct {
	ProductID int `json:"product_id"`
	Quantity  int `json:"quantity"`
}

type PaginatedOrdersResponse struct {
	Orders     []Order `json:"orders"`
	TotalPages int     `json:"totalPages"`
	Page       int     `json:"page"`
}
