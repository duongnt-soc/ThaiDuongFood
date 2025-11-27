package api

import (
	"database/sql"

	"github.com/gorilla/mux"
)

func RegisterRoutes(r *mux.Router, db *sql.DB) {
	h := &handler{db: db}

	// Auth api
	r.HandleFunc("/api/auth/register", h.register).Methods("POST")
	r.HandleFunc("/api/auth/login", h.login).Methods("POST")
	r.HandleFunc("/api/auth/logout", h.logout).Methods("POST")
	r.HandleFunc("/api/auth/forgot-password", h.requestPasswordReset).Methods("POST")
	r.HandleFunc("/api/auth/reset-password", h.resetPassword).Methods("POST")
	r.HandleFunc("/api/search", h.searchProductsAI).Methods("GET")
	r.HandleFunc("/api/products/{id}/related", h.getRelatedProductsAI).Methods("GET")

	// Public api
	r.HandleFunc("/api/products", h.getProducts).Methods("GET")
	r.HandleFunc("/api/products/{slug}", h.getProductBySlug).Methods("GET")
	r.HandleFunc("/api/orders", h.createOrder).Methods("POST")
	r.HandleFunc("/api/chatbot/conversation", h.analyzeConversation).Methods("POST")
	r.HandleFunc("/api/categories", h.getCategories).Methods("GET")
	r.HandleFunc("/api/products/{id}/reviews", h.getReviews).Methods("GET")

	// Payment Routes
	r.HandleFunc("/api/payment/momo", h.createMoMoPayment).Methods("POST")
	r.HandleFunc("/api/payment/bank-transfer", h.createBankTransferPayment).Methods("POST")
	r.HandleFunc("/api/payment/demo", h.createDemoPayment).Methods("POST")
	r.HandleFunc("/api/webhook/momo", h.handleMoMoIPN).Methods("POST")
	r.HandleFunc("/api/orders/{id}/status", h.getOrderStatus).Methods("GET")

	// Admin Routes
	adminRouter := r.PathPrefix("/api/admin").Subrouter()
	adminRouter.HandleFunc("/stats", h.getDashboardStats).Methods("GET")
	adminRouter.HandleFunc("/users", h.getAllUsers).Methods("GET")
	adminRouter.HandleFunc("/products", h.createProduct).Methods("POST")
	adminRouter.HandleFunc("/products/{id}", h.updateProduct).Methods("PUT")
	adminRouter.HandleFunc("/products/{id}", h.deleteProduct).Methods("DELETE")

	adminRouter.HandleFunc("/categories", h.createCategory).Methods("POST")
	adminRouter.HandleFunc("/categories/{id}", h.updateCategory).Methods("PUT")
	adminRouter.HandleFunc("/categories/{id}", h.deleteCategory).Methods("DELETE")

	adminRouter.HandleFunc("/orders", h.getAllOrders).Methods("GET")
	adminRouter.HandleFunc("/orders/{id}", h.getAdminOrderDetails).Methods("GET")
	adminRouter.HandleFunc("/orders/{id}/status", h.updateOrderStatus).Methods("PUT")
	adminRouter.HandleFunc("/orders/{id}/pdf", h.adminExportOrderPDF).Methods("GET")

	adminRouter.HandleFunc("/reviews", h.adminGetAllReviews).Methods("GET")
	adminRouter.HandleFunc("/reviews/{reviewId}", h.adminDeleteReview).Methods("DELETE")
	adminRouter.HandleFunc("/reviews/{reviewId}/reply", h.replyToReview).Methods("PUT")

	adminRouter.HandleFunc("/vouchers", h.createVoucher).Methods("POST")
    adminRouter.HandleFunc("/vouchers", h.getAllVouchers).Methods("GET")
    adminRouter.HandleFunc("/vouchers/{id}", h.updateVoucher).Methods("PUT")
    adminRouter.HandleFunc("/vouchers/{id}", h.deleteVoucher).Methods("DELETE")

	// User Routes (Admin, Client)
	userRouter := r.PathPrefix("/api/user").Subrouter()
	userRouter.Use(h.AuthMiddleware)
	userRouter.HandleFunc("/orders", h.getUserOrders).Methods("GET")
	userRouter.HandleFunc("/orders/{id}", h.getOrderDetails).Methods("GET")
	userRouter.HandleFunc("/cart", h.getCart).Methods("GET")
	userRouter.HandleFunc("/cart", h.addToCart).Methods("POST")
	userRouter.HandleFunc("/cart", h.clearUserCart).Methods("DELETE")
	userRouter.HandleFunc("/cart/{productId}", h.updateCartItem).Methods("PUT")
	userRouter.HandleFunc("/cart/{productId}", h.removeFromCart).Methods("DELETE")
	userRouter.HandleFunc("/products/{id}/reviews", h.createReview).Methods("POST")
	userRouter.HandleFunc("/reviews/{reviewId}", h.updateReview).Methods("PUT")
	userRouter.HandleFunc("/vouchers/claimable", h.getClaimableVouchers).Methods("GET")
    userRouter.HandleFunc("/vouchers/claim/{id}", h.claimVoucher).Methods("POST")
    userRouter.HandleFunc("/vouchers", h.getUserVouchers).Methods("GET")
	userRouter.HandleFunc("/vouchers/{id}", h.deleteUserVoucher).Methods("DELETE")
	userRouter.HandleFunc("/orders/{id}/pdf", h.exportOrderPDF).Methods("GET")

}
