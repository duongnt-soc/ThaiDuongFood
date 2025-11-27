package models

type MoMoRequestPayload struct {
	UserID               *int              `json:"user_id"`
	CustomerName         string            `json:"customer_name"`
	CustomerPhone        string            `json:"customer_phone"`
	ShippingAddress      string            `json:"shipping_address"`
	CartItems            []CartItemRequest `json:"cart_items"`
	AppliedUserVoucherID *int              `json:"applied_user_voucher_id"`
}
