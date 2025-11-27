export interface LoginRequest {
  username?: string
  password?: string
}

export interface LoginResponse {
  id: number
  token: string
  username: string
  email: string
  is_admin: boolean
}

export interface RegisterRequest {
  username?: string
  email?: string
  password?: string
}

export interface Product {
  id: number
  name: string
  price: number
  image: string
  slug: string
  description: string
  details: string
  quantity: number
  category_id?: number
  calories?: number
  protein_grams?: number
  carb_grams?: number
  fat_grams?: number
}

export interface PaginatedProducts {
  products: Product[]
  totalPages: number
  page: number
}

export interface OrderItem {
  id: number
  product_id: number
  product_name: string
  product_image: string
  quantity: number
  price_at_purchase: number
}

export interface Order {
  id: number
  customer_name: string
  customer_phone: string
  shipping_address: string
  total_amount: number
  status: string
  created_at: string
  username: string
  items?: OrderItem[]
}

export interface ProductPayload {
  name: string
  price: number
  quantity: number
  image: string
  slug: string
  description?: string
  details?: string
  category_id?: number | null
  calories?: number
  protein_grams?: number
  carb_grams?: number
  fat_grams?: number
}

export interface OrderPayload {
  user_id?: number | null
  customer_name: string
  customer_phone: string
  shipping_address: string
  cart_items: { product_id: number; quantity: number }[]
  applied_user_voucher_id?: number | null
}

export interface ChatbotResponse {
  message: string
  suggestion?: Product
}

export interface UserProfile {
  user_id?: number
  height_cm?: number | string
  weight_kg?: number | string
  health_conditions?: string
  dietary_preference?: string
}

export interface ChatMessage {
  sender: "bot" | "user"
  text: string
}

export interface Category {
  id: number
  name: string
  slug: string
}

export interface CategoryPayload {
  name: string
  slug: string
}

export interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  totalProducts: number
  totalCategories: number
  dailyRevenue: { date: string; revenue: number }[]
  topProducts: TopProduct[]
  topCustomers: TopCustomer[]
}

export interface User {
  id: number
  username: string
  email: string
  created_at: string
}

export interface PaginatedOrders {
  orders: Order[]
  totalPages: number
  page: number
}

export interface PaginatedCategories {
  categories: Category[]
  totalPages: number
  page: number
}

export interface TopProduct {
  name: string
  totalSold: number
}

export interface TopCustomer {
  name: string
  totalSpent: number
}

export interface Review {
  id: number
  username: string
  product_name: string
  rating: number
  comment: string
  created_at: string
  user_id: number
  admin_reply?: string | null
}

export interface ReviewPayload {
  rating: number
  comment: string
}

export interface PaginatedReviews {
  reviews: Review[]
  totalPages: number
  page: number
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  password?: string
}

export interface Voucher {
  id: number
  code: string
  description?: string
  discount_type: "percentage" | "fixed_amount"
  discount_value: number
  hunt_start_time: string
  hunt_end_time: string
  valid_duration_days: number
  applicable_product_ids: number[] | null
  created_at: string
}

export interface UserVoucher {
  id: number
  user_id: number
  voucher_id: number
  claimed_at: string
  expires_at: string
  is_used: boolean
  voucher_info: Voucher
}

export interface MessageResponse {
  message: string
}
