package models

type DashboardStats struct {
	TotalRevenue    float64      `json:"totalRevenue"`
	TotalOrders     int          `json:"totalOrders"`
	TotalCustomers  int          `json:"totalCustomers"`
	TotalProducts   int          `json:"totalProducts"`   
	TotalCategories int          `json:"totalCategories"` 
	DailyRevenue    []DailyRevenue `json:"dailyRevenue"`
	TopProducts     []TopProduct    `json:"topProducts"`   
	TopCustomers    []TopCustomer   `json:"topCustomers"`  
}

type DailyRevenue struct {
	Date    string  `json:"date"`
	Revenue float64 `json:"revenue"`
}

type TopProduct struct {
	Name       string `json:"name"`
	TotalSold  int    `json:"totalSold"`
}

type TopCustomer struct {
	Name        string  `json:"name"`
	TotalSpent  float64 `json:"totalSpent"`
}