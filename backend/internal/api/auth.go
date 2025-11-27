package api

import (
	"crypto/rand"
	"crypto/sha256"
	"database/sql"
	// "encoding/base64"
	"encoding/json"
	"net/http"
	"time"
	"log"
	"fmt"
	"os"
	"encoding/hex"
	"backend/internal/models"
	"backend/internal/utils"

	"github.com/dgrijalva/jwt-go"
	"golang.org/x/crypto/bcrypt"
)

var jwtKey = []byte(os.Getenv("JWT_SECRET_KEY"))

type Claims struct {
	Username string `json:"username"`
	IsAdmin  bool   `json:"is_admin"`
	jwt.StandardClaims
}

func (h *handler) register(w http.ResponseWriter, r *http.Request) {
	var req models.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Dữ liệu không hợp lệ")
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi khi mã hóa mật khẩu")
		return
	}

	var userID int
	err = h.db.QueryRow(
		"INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id",
		req.Username, req.Email, string(hashedPassword),
	).Scan(&userID)

	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Không thể tạo người dùng")
		return
	}

	utils.RespondWithJSON(w, http.StatusCreated, map[string]interface{}{
		"message": "Đăng ký thành công",
		"user_id": userID,
	})
}

func (h *handler) login(w http.ResponseWriter, r *http.Request) {
	var req models.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Dữ liệu không hợp lệ")
		return
	}

	var user models.User
	err := h.db.QueryRow("SELECT id, username, password_hash, is_admin, email FROM users WHERE username = $1", req.Username).Scan(&user.ID, &user.Username, &user.PasswordHash, &user.IsAdmin, &user.Email)
	if err != nil {
		if err == sql.ErrNoRows {
			utils.RespondWithError(w, http.StatusUnauthorized, "Tên đăng nhập hoặc mật khẩu không đúng")
		} else {
			utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi CSDL")
		}
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		log.Println("!!! Lỗi so sánh mật khẩu: ", err)
		utils.RespondWithError(w, http.StatusUnauthorized, "Tên đăng nhập hoặc mật khẩu không đúng")
		return
	}

	expirationTime := time.Now().Add(24 * time.Hour)
	claims := &Claims{
		Username: user.Username,
		IsAdmin:  user.IsAdmin,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: expirationTime.Unix(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	if len(jwtKey) == 0 {
		log.Fatal("Lỗi nghiêm trọng: JWT_SECRET_KEY chưa được set")
		utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi cấu hình server")
		return
	}
	tokenString, err := token.SignedString(jwtKey)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Không thể tạo token")
		return
	}

	utils.RespondWithJSON(w, http.StatusOK, models.LoginResponse{
		Token:    tokenString,
		Username: user.Username,
		IsAdmin:  user.IsAdmin,
		ID:       user.ID,
		Email:    user.Email,
	})
}

func (h *handler) logout(w http.ResponseWriter, r *http.Request) {
	utils.RespondWithJSON(w, http.StatusOK, map[string]string{"message": "Logged out successfully"})
}

func (h *handler) requestPasswordReset(w http.ResponseWriter, r *http.Request) {
	var req models.ForgotPasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Dữ liệu không hợp lệ")
		return
	}

	var userID int
	err := h.db.QueryRow("SELECT id FROM users WHERE email = $1", req.Email).Scan(&userID)
	if err != nil {
		utils.RespondWithJSON(w, http.StatusOK, map[string]string{"message": "Nếu email tồn tại, một liên kết đặt lại mật khẩu đã được gửi."})
		return
	}

	// Tạo token ngẫu nhiên
	tokenBytes := make([]byte, 32)
	rand.Read(tokenBytes)

	token := hex.EncodeToString(tokenBytes)

	// Băm token (logic này vẫn giữ nguyên)
	tokenHashBytes := sha256.Sum256([]byte(token))
	tokenHashStr := hex.EncodeToString(tokenHashBytes[:])

    // SỬA Ở ĐÂY: Sử dụng UTC để tạo thời gian hết hạn
    expiresAt := time.Now().UTC().Add(15 * time.Minute)

    _, err = h.db.Exec(
        "INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)",
        userID, tokenHashStr, expiresAt,
    )
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Không thể tạo yêu cầu đặt lại mật khẩu")
		return
	}

	frontendURL := os.Getenv("PUBLIC_FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:3000"
	}

	resetLink := fmt.Sprintf("%s/reset-password/%s", frontendURL, token)

	// Gửi email
	err = utils.SendPasswordResetEmail(req.Email, resetLink)
	if err != nil {
		log.Printf("ERROR: Could not send password reset email to %s: %v", req.Email, err)
	}

	utils.RespondWithJSON(w, http.StatusOK, map[string]string{"message": "Nếu email tồn tại, một liên kết đặt lại mật khẩu đã được gửi."})
}

func (h *handler) resetPassword(w http.ResponseWriter, r *http.Request) {
	var req models.ResetPasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Dữ liệu không hợp lệ")
		return
	}

	// Băm token nhận được từ client để so sánh
	tokenHash := sha256.Sum256([]byte(req.Token))
	tokenHashStr := hex.EncodeToString(tokenHash[:])

	var userID int
	var expiresAt time.Time
	err := h.db.QueryRow(
		"SELECT user_id, expires_at FROM password_reset_tokens WHERE token_hash = $1",
		tokenHashStr,
	).Scan(&userID, &expiresAt)

	if err != nil {
		utils.RespondWithError(w, http.StatusBadRequest, "Token không hợp lệ hoặc đã hết hạn.")
		return
	}

	if time.Now().UTC().After(expiresAt) {
        utils.RespondWithError(w, http.StatusBadRequest, "Token đã hết hạn.")
        h.db.Exec("DELETE FROM password_reset_tokens WHERE token_hash = $1", tokenHashStr)
        return
    }

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Lỗi khi mã hóa mật khẩu mới")
		return
	}

	_, err = h.db.Exec("UPDATE users SET password_hash = $1 WHERE id = $2", string(hashedPassword), userID)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, "Không thể cập nhật mật khẩu")
		return
	}

	h.db.Exec("DELETE FROM password_reset_tokens WHERE user_id = $1", userID)

	utils.RespondWithJSON(w, http.StatusOK, map[string]string{"message": "Mật khẩu đã được đặt lại thành công."})
}
