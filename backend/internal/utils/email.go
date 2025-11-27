// internal/utils/email.go
package utils

import (
	"fmt"
	"gopkg.in/gomail.v2"
	"os"
)

func SendPasswordResetEmail(toEmail string, resetLink string) error {
	senderEmail := os.Getenv("SENDER_EMAIL")
	sendgridAPIKey := os.Getenv("SENDGRID_API_KEY")

	m := gomail.NewMessage()
	m.SetHeader("From", senderEmail)
	m.SetHeader("To", toEmail)
	m.SetHeader("Subject", "Yêu cầu đặt lại mật khẩu cho Thai Duong's Food")

	// Tạo nội dung email bằng HTML
	emailBody := fmt.Sprintf(`
		<p>Xin chào,</p>
		<p>Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng nhấn vào đường link dưới đây để tiếp tục:</p>
		<a href="%s">Đặt lại mật khẩu của bạn</a>
		<p>Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.</p>
	`, resetLink)
	m.SetBody("text/html", emailBody)

	d := gomail.NewDialer("smtp.sendgrid.net", 587, "apikey", sendgridAPIKey)

	// Gửi email
	if err := d.DialAndSend(m); err != nil {
		return err
	}

	return nil
}
