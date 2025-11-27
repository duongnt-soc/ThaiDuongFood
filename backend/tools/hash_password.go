package main

import (
	"fmt"
	"log"
	"os"

	"golang.org/x/crypto/bcrypt"
)

func main() {
	if len(os.Args) < 2 {
		log.Fatal("Vui lòng cung cấp mật khẩu cần hash. Ví dụ: go run ./tools/hash_password.go your_password")
	}

	password := os.Args[1]

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("Lỗi khi hash mật khẩu: %v", err)
	}

	fmt.Println("Password:", password)
	fmt.Println("Hashed Password:", string(hashedPassword))
	fmt.Println("\n=> Sao chép chuỗi Hashed Password ở trên để cập nhật vào CSDL.")
}