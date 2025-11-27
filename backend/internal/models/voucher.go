package models

import "time"

// Voucher represents the main voucher template created by an admin.
type Voucher struct {
	ID                   int        `json:"id"`
	Code                 string     `json:"code"`
	Description          string     `json:"description"`
	DiscountType         string     `json:"discount_type"`
	DiscountValue        int64      `json:"discount_value"`
	HuntStartTime        time.Time  `json:"hunt_start_time"`
	HuntEndTime          time.Time  `json:"hunt_end_time"`
	ValidDurationDays    int        `json:"valid_duration_days"`
	ApplicableProductIDs *[]int32   `json:"applicable_product_ids"`
	CreatedAt            time.Time  `json:"created_at"`
}

// UserVoucher represents a voucher that a user has claimed.
type UserVoucher struct {
	ID          int       `json:"id"`
	UserID      int       `json:"user_id"`
	VoucherID   int       `json:"voucher_id"`
	ClaimedAt   time.Time `json:"claimed_at"`
	ExpiresAt   time.Time `json:"expires_at"`
	IsUsed      bool      `json:"is_used"`
	VoucherInfo Voucher   `json:"voucher_info,omitempty"` 
}

// VoucherPayload is used for creating/updating vouchers by an admin.
type VoucherPayload struct {
	Code                 string    `json:"code"`
	Description          string    `json:"description"`
	DiscountType         string    `json:"discount_type"`
	DiscountValue        int64     `json:"discount_value"`
	HuntStartTime        time.Time `json:"hunt_start_time"`
	HuntEndTime          time.Time `json:"hunt_end_time"`
	ValidDurationDays    int       `json:"valid_duration_days"`
	ApplicableProductIDs []int32   `json:"applicable_product_ids"`
}
