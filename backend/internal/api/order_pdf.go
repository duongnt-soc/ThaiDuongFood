package api

import (
	"database/sql"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"backend/internal/models"
	"backend/internal/utils"

	"github.com/gorilla/mux"
	"github.com/jung-kurt/gofpdf"
)

// Helper function to remove Vietnamese accents
func removeVietnameseAccents(s string) string {
	replacements := map[string]string{
		"à": "a", "á": "a", "ả": "a", "ã": "a", "ạ": "a",
		"ă": "a", "ằ": "a", "ắ": "a", "ẳ": "a", "ẵ": "a", "ặ": "a",
		"â": "a", "ầ": "a", "ấ": "a", "ẩ": "a", "ẫ": "a", "ậ": "a",
		"đ": "d",
		"è": "e", "é": "e", "ẻ": "e", "ẽ": "e", "ẹ": "e",
		"ê": "e", "ề": "e", "ế": "e", "ể": "e", "ễ": "e", "ệ": "e",
		"ì": "i", "í": "i", "ỉ": "i", "ĩ": "i", "ị": "i",
		"ò": "o", "ó": "o", "ỏ": "o", "õ": "o", "ọ": "o",
		"ô": "o", "ồ": "o", "ố": "o", "ổ": "o", "ỗ": "o", "ộ": "o",
		"ơ": "o", "ờ": "o", "ớ": "o", "ở": "o", "ỡ": "o", "ợ": "o",
		"ù": "u", "ú": "u", "ủ": "u", "ũ": "u", "ụ": "u",
		"ư": "u", "ừ": "u", "ứ": "u", "ử": "u", "ữ": "u", "ự": "u",
		"ỳ": "y", "ý": "y", "ỷ": "y", "ỹ": "y", "ỵ": "y",
		"À": "A", "Á": "A", "Ả": "A", "Ã": "A", "Ạ": "A",
		"Ă": "A", "Ằ": "A", "Ắ": "A", "Ẳ": "A", "Ẵ": "A", "Ặ": "A",
		"Â": "A", "Ầ": "A", "Ấ": "A", "Ẩ": "A", "Ẫ": "A", "Ậ": "A",
		"Đ": "D",
		"È": "E", "É": "E", "Ẻ": "E", "Ẽ": "E", "Ẹ": "E",
		"Ê": "E", "Ề": "E", "Ế": "E", "Ể": "E", "Ễ": "E", "Ệ": "E",
		"Ì": "I", "Í": "I", "Ỉ": "I", "Ĩ": "I", "Ị": "I",
		"Ò": "O", "Ó": "O", "Ỏ": "O", "Õ": "O", "Ọ": "O",
		"Ô": "O", "Ồ": "O", "Ố": "O", "Ổ": "O", "Ỗ": "O", "Ộ": "O",
		"Ơ": "O", "Ờ": "O", "Ớ": "O", "Ở": "O", "Ỡ": "O", "Ợ": "O",
		"Ù": "U", "Ú": "U", "Ủ": "U", "Ũ": "U", "Ụ": "U",
		"Ư": "U", "Ừ": "U", "Ứ": "U", "Ử": "U", "Ữ": "U", "Ự": "U",
		"Ỳ": "Y", "Ý": "Y", "Ỷ": "Y", "Ỹ": "Y", "Ỵ": "Y",
	}

	result := s
	for viet, latin := range replacements {
		result = strings.ReplaceAll(result, viet, latin)
	}
	return result
}

func (h *handler) exportOrderPDF(w http.ResponseWriter, r *http.Request) {
	userID, _ := r.Context().Value("userID").(int)
	vars := mux.Vars(r)
	orderID, err := strconv.Atoi(vars["id"])
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid order ID")
		return
	}

	// Lấy thông tin đơn hàng (THÊM discount_amount và voucher code)
	var order models.Order
	var voucherCode sql.NullString
	err = h.db.QueryRow(`
        SELECT o.id, o.customer_name, o.customer_phone, o.shipping_address,
               o.total_amount, o.discount_amount, o.status, o.created_at,
               v.code
        FROM orders o
        LEFT JOIN user_vouchers uv ON o.applied_voucher_id = uv.id
        LEFT JOIN vouchers v ON uv.voucher_id = v.id
        WHERE o.id = $1 AND o.user_id = $2
    `, orderID, userID).Scan(&order.ID, &order.CustomerName, &order.CustomerPhone,
		&order.ShippingAddress, &order.TotalAmount, &order.DiscountAmount,
		&order.Status, &order.CreatedAt, &voucherCode)

	if err != nil {
		if err == sql.ErrNoRows {
			utils.RespondWithError(w, http.StatusNotFound, "Order not found")
			return
		}
		utils.RespondWithError(w, http.StatusInternalServerError, "Database error")
		return
	}

	if voucherCode.Valid {
		order.VoucherCode = voucherCode.String
	}

	// Lấy các items của đơn hàng
	rows, err := h.db.Query(`
        SELECT oi.id, oi.product_id, oi.quantity, oi.price_at_purchase, p.name, p.image
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = $1
    `, orderID)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Database error")
		return
	}
	defer rows.Close()

	var items []models.OrderItem
	for rows.Next() {
		var item models.OrderItem
		var productImage sql.NullString
		if err := rows.Scan(&item.ID, &item.ProductID, &item.Quantity,
			&item.PriceAtPurchase, &item.ProductName, &productImage); err != nil {
			utils.RespondWithError(w, http.StatusInternalServerError, "Error scanning items")
			return
		}
		item.ProductImage = productImage.String
		items = append(items, item)
	}
	order.Items = items

	// Tạo PDF
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.AddPage()
	pdf.SetFont("Arial", "B", 16)

	pdf.Cell(190, 10, "DON HANG")
	pdf.Ln(12)

	pdf.SetFont("Arial", "B", 12)
	pdf.Cell(190, 8, fmt.Sprintf("Ma don hang: #%d", order.ID))
	pdf.Ln(8)

	pdf.SetFont("Arial", "", 10)
	timeStr := order.CreatedAt.Format("02/01/2006 15:04:05")
	pdf.Cell(190, 6, fmt.Sprintf("Thoi gian dat hang: %s", timeStr))
	pdf.Ln(6)

	pdf.Cell(190, 6, fmt.Sprintf("Khach hang: %s", removeVietnameseAccents(order.CustomerName)))
	pdf.Ln(6)
	pdf.Cell(190, 6, fmt.Sprintf("So dien thoai: %s", order.CustomerPhone))
	pdf.Ln(6)
	pdf.Cell(190, 6, fmt.Sprintf("Dia chi: %s", removeVietnameseAccents(order.ShippingAddress)))
	pdf.Ln(6)
	pdf.Cell(190, 6, fmt.Sprintf("Trang thai: %s", order.Status))
	pdf.Ln(12)

	// Bảng sản phẩm
	pdf.SetFont("Arial", "B", 10)
	pdf.SetFillColor(240, 240, 240)
	pdf.CellFormat(80, 8, "San pham", "1", 0, "C", true, 0, "")
	pdf.CellFormat(30, 8, "So luong", "1", 0, "C", true, 0, "")
	pdf.CellFormat(40, 8, "Don gia", "1", 0, "C", true, 0, "")
	pdf.CellFormat(40, 8, "Thanh tien", "1", 1, "C", true, 0, "")

	pdf.SetFont("Arial", "", 9)
	var subtotal int64 = 0
	for _, item := range items {
		itemTotal := item.PriceAtPurchase * int64(item.Quantity)
		subtotal += itemTotal
		pdf.CellFormat(80, 8, removeVietnameseAccents(item.ProductName), "1", 0, "L", false, 0, "")
		pdf.CellFormat(30, 8, fmt.Sprintf("%d", item.Quantity), "1", 0, "C", false, 0, "")
		pdf.CellFormat(40, 8, fmt.Sprintf("%d VND", item.PriceAtPurchase), "1", 0, "R", false, 0, "")
		pdf.CellFormat(40, 8, fmt.Sprintf("%d VND", itemTotal), "1", 1, "R", false, 0, "")
	}

	// Tổng phụ, giảm giá, tổng cộng
	pdf.Ln(4)
	pdf.SetFont("Arial", "", 10)

	// Tạm tính
	pdf.Cell(150, 8, "Tam tinh:")
	pdf.Cell(40, 8, fmt.Sprintf("%d VND", subtotal))
	pdf.Ln(6)

	// Giảm giá (nếu có)
	if order.DiscountAmount > 0 {
		discountText := "Giam gia:"
		if order.VoucherCode != "" {
			discountText = fmt.Sprintf("Giam gia (%s):", order.VoucherCode)
		}
		pdf.Cell(150, 8, discountText)
		pdf.Cell(40, 8, fmt.Sprintf("-%d VND", order.DiscountAmount))
		pdf.Ln(6)
	}

	// Tổng cộng
	pdf.SetFont("Arial", "B", 12)
	pdf.Cell(150, 10, "TONG CONG:")
	pdf.Cell(40, 10, fmt.Sprintf("%d VND", order.TotalAmount))

	// Output PDF
	w.Header().Set("Content-Type", "application/pdf")
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=order_%d.pdf", order.ID))

	err = pdf.Output(w)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Error generating PDF")
		return
	}
}

// Hàm cho admin (tương tự)
func (h *handler) adminExportOrderPDF(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	orderID, err := strconv.Atoi(vars["id"])
	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Invalid order ID")
		return
	}

	// Lấy thông tin đơn hàng
	var order models.Order
	var voucherCode sql.NullString
	err = h.db.QueryRow(`
        SELECT o.id, o.customer_name, o.customer_phone, o.shipping_address,
               o.total_amount, o.discount_amount, o.status, o.created_at,
               v.code
        FROM orders o
        LEFT JOIN user_vouchers uv ON o.applied_voucher_id = uv.id
        LEFT JOIN vouchers v ON uv.voucher_id = v.id
        WHERE o.id = $1
    `, orderID).Scan(&order.ID, &order.CustomerName, &order.CustomerPhone,
		&order.ShippingAddress, &order.TotalAmount, &order.DiscountAmount,
		&order.Status, &order.CreatedAt, &voucherCode)

	if err != nil {
		if err == sql.ErrNoRows {
			utils.RespondWithError(w, http.StatusNotFound, "Order not found")
			return
		}
		utils.RespondWithError(w, http.StatusInternalServerError, "Database error")
		return
	}

	if voucherCode.Valid {
		order.VoucherCode = voucherCode.String
	}

	// Lấy các items
	rows, err := h.db.Query(`
        SELECT oi.id, oi.product_id, oi.quantity, oi.price_at_purchase, p.name, p.image
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = $1
    `, orderID)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Database error")
		return
	}
	defer rows.Close()

	var items []models.OrderItem
	for rows.Next() {
		var item models.OrderItem
		var productImage sql.NullString
		if err := rows.Scan(&item.ID, &item.ProductID, &item.Quantity,
			&item.PriceAtPurchase, &item.ProductName, &productImage); err != nil {
			utils.RespondWithError(w, http.StatusInternalServerError, "Error scanning items")
			return
		}
		item.ProductImage = productImage.String
		items = append(items, item)
	}
	order.Items = items

	// Tạo PDF
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.AddPage()
	pdf.SetFont("Arial", "B", 16)

	pdf.Cell(190, 10, "DON HANG")
	pdf.Ln(12)

	pdf.SetFont("Arial", "B", 12)
	pdf.Cell(190, 8, fmt.Sprintf("Ma don hang: #%d", order.ID))
	pdf.Ln(8)

	pdf.SetFont("Arial", "", 10)
	timeStr := order.CreatedAt.Format("02/01/2006 15:04:05")
	pdf.Cell(190, 6, fmt.Sprintf("Thoi gian dat hang: %s", timeStr))
	pdf.Ln(6)

	pdf.Cell(190, 6, fmt.Sprintf("Khach hang: %s", removeVietnameseAccents(order.CustomerName)))
	pdf.Ln(6)
	pdf.Cell(190, 6, fmt.Sprintf("So dien thoai: %s", order.CustomerPhone))
	pdf.Ln(6)
	pdf.Cell(190, 6, fmt.Sprintf("Dia chi: %s", removeVietnameseAccents(order.ShippingAddress)))
	pdf.Ln(6)
	pdf.Cell(190, 6, fmt.Sprintf("Trang thai: %s", order.Status))
	pdf.Ln(12)

	pdf.SetFont("Arial", "B", 10)
	pdf.SetFillColor(240, 240, 240)
	pdf.CellFormat(80, 8, "San pham", "1", 0, "C", true, 0, "")
	pdf.CellFormat(30, 8, "So luong", "1", 0, "C", true, 0, "")
	pdf.CellFormat(40, 8, "Don gia", "1", 0, "C", true, 0, "")
	pdf.CellFormat(40, 8, "Thanh tien", "1", 1, "C", true, 0, "")

	pdf.SetFont("Arial", "", 9)
	var subtotal int64 = 0
	for _, item := range items {
		itemTotal := item.PriceAtPurchase * int64(item.Quantity)
		subtotal += itemTotal
		pdf.CellFormat(80, 8, removeVietnameseAccents(item.ProductName), "1", 0, "L", false, 0, "")
		pdf.CellFormat(30, 8, fmt.Sprintf("%d", item.Quantity), "1", 0, "C", false, 0, "")
		pdf.CellFormat(40, 8, fmt.Sprintf("%d VND", item.PriceAtPurchase), "1", 0, "R", false, 0, "")
		pdf.CellFormat(40, 8, fmt.Sprintf("%d VND", itemTotal), "1", 1, "R", false, 0, "")
	}

	pdf.Ln(4)
	pdf.SetFont("Arial", "", 10)

	pdf.Cell(150, 8, "Tam tinh:")
	pdf.Cell(40, 8, fmt.Sprintf("%d VND", subtotal))
	pdf.Ln(6)

	if order.DiscountAmount > 0 {
		discountText := "Giam gia:"
		if order.VoucherCode != "" {
			discountText = fmt.Sprintf("Giam gia (%s):", order.VoucherCode)
		}
		pdf.Cell(150, 8, discountText)
		pdf.Cell(40, 8, fmt.Sprintf("-%d VND", order.DiscountAmount))
		pdf.Ln(6)
	}

	pdf.SetFont("Arial", "B", 12)
	pdf.Cell(150, 10, "TONG CONG:")
	pdf.Cell(40, 10, fmt.Sprintf("%d VND", order.TotalAmount))

	w.Header().Set("Content-Type", "application/pdf")
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=order_%d.pdf", order.ID))

	err = pdf.Output(w)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Error generating PDF")
		return
	}
}
