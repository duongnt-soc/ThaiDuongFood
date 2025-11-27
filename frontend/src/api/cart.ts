import { CartItem } from "@/zustand/cartStore"

import apiClient from "."

const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken")
  return { Authorization: `Bearer ${token}` }
}

export const fetchCartFromDB = async (): Promise<CartItem[]> => {
  const response = await apiClient.get<CartItem[]>("/user/cart", { headers: getAuthHeaders() })
  return response.data
}

export const addToCartDB = async (productId: number, quantity: number): Promise<any> => {
  return apiClient.post(
    "/user/cart",
    { product_id: productId, quantity },
    { headers: getAuthHeaders() }
  )
}

export const updateQuantityDB = async (productId: number, quantity: number): Promise<any> => {
  return apiClient.put(`/user/cart/${productId}`, { quantity }, { headers: getAuthHeaders() })
}

export const removeFromCartDB = async (productId: number): Promise<any> => {
  return apiClient.delete(`/user/cart/${productId}`, { headers: getAuthHeaders() })
}

export const clearCartDB = async (): Promise<void> => {
  await apiClient.delete("/user/cart", { headers: getAuthHeaders() })
}
