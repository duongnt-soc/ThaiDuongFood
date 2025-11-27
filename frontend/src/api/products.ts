import { Product, PaginatedProducts, ProductPayload } from "@/types/api"

import apiClient from "."

export const getProducts = async (
  page: number = 1,
  limit: number = 9,
  search: string = "",
  category: string = "",
  useAISearch: boolean = false
): Promise<PaginatedProducts> => {
  const response = await apiClient.get<PaginatedProducts>(
    `/products?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&category=${category}&ai_search=${useAISearch}`
  )
  return response.data
}

export const getProductBySlug = async (slug: string): Promise<Product> => {
  const response = await apiClient.get<Product>(`/products/${slug}`)
  return response.data
}

export const createProduct = async (productData: ProductPayload): Promise<any> => {
  const response = await apiClient.post("/admin/products", productData)
  return response.data
}

export const updateProduct = async (id: number, productData: ProductPayload): Promise<any> => {
  const response = await apiClient.put(`/admin/products/${id}`, productData)
  return response.data
}

export const deleteProduct = async (id: number): Promise<any> => {
  const response = await apiClient.delete(`/admin/products/${id}`)
  return response.data
}

export const searchProductsAI = async (query: string, limit: number = 5): Promise<Product[]> => {
  const response = await apiClient.get<Product[]>(
    `/search?q=${encodeURIComponent(query)}&limit=${limit}`
  )
  return response.data
}

export const getRelatedProducts = async (
  productId: number,
  limit: number = 5
): Promise<Product[]> => {
  const response = await apiClient.get<Product[]>(`/products/${productId}/related?limit=${limit}`)
  return response.data
}
