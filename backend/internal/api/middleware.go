package api

import (
	"context"
	"net/http"
	"strings"
	"backend/internal/utils"

	"github.com/dgrijalva/jwt-go"
)

// Check token
func (h *handler) AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			utils.RespondWithError(w, http.StatusUnauthorized, "Authorization header required")
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			utils.RespondWithError(w, http.StatusUnauthorized, "Invalid token format")
			return
		}

		claims := &Claims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			return jwtKey, nil
		})

		if err != nil || !token.Valid {
			utils.RespondWithError(w, http.StatusUnauthorized, "Invalid token")
			return
		}

		// Get information user db
		var userID int
		err = h.db.QueryRow("SELECT id FROM users WHERE username = $1", claims.Username).Scan(&userID)
		if err != nil {
			utils.RespondWithError(w, http.StatusUnauthorized, "User not found")
			return
		}
		
		// Assign userID
		ctx := context.WithValue(r.Context(), "userID", userID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}