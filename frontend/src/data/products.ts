export interface Product {
  id: number
  name: string
  price: number
  image: string
  slug: string // Dùng cho URL, ví dụ: /products/margherita-pizza
  description: string
  details: string
  quantity: number
}
