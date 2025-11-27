package main

import (
	"backend/internal/api"
	"backend/internal/db"
	"log"
	"net/http"

	"github.com/gorilla/handlers"
	"github.com/joho/godotenv"
	"github.com/gorilla/mux"
	_ "github.com/lib/pq"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: .env file not found")
	}

	// Connect DB
	database, err := db.Connect()
	if err != nil {
		log.Fatalf("Không thể kết nối tới database: %v", err)
	}
	defer database.Close()

	log.Println("Kết nối database thành công!")

	// Router
	r := mux.NewRouter()

	// Register routes
	api.RegisterRoutes(r, database)

	allowedOrigins := handlers.AllowedOrigins([]string{
		"http://localhost:3000",
		"http://localhost:3124",
		"https://graduation-project-seven-sepia.vercel.app",
	})
	allowedMethods := handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"})
	allowedHeaders := handlers.AllowedHeaders([]string{"X-Requested-With", "Content-Type", "Authorization"})
	allowCredentials := handlers.AllowCredentials()

	// Start server
	port := ":8080"
	log.Printf("Server đang chạy tại cổng %s", port)
	if err := http.ListenAndServe(port, handlers.CORS(allowedOrigins, allowedMethods, allowedHeaders, allowCredentials)(r)); err != nil {
		log.Fatal(err)
	}
}
