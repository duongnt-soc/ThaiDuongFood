package db

import (
	"database/sql"
	"fmt"
	"os"
)

func Connect() (*sql.DB, error) {
    user := getEnv("POSTGRES_USER", "myuser")
	password := getEnv("POSTGRES_PASSWORD", "mypassword")
	dbname := getEnv("POSTGRES_DB", "bistro_bliss")
	host := getEnv("DB_HOST", "localhost") 
	port := getEnv("DB_PORT", "5432")

	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)

    db, err := sql.Open("postgres", connStr)
    if err != nil { return nil, err }
    if err = db.Ping(); err != nil { return nil, err }
    return db, nil
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}