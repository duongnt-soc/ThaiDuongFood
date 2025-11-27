import { Category, CategoryPayload, PaginatedCategories } from "@/types/api"

import apiClient from "."

export const getCategories = async (page: number = 1, limit: number = 10): Promise<PaginatedCategories> => {
  const response = await apiClient.get<PaginatedCategories>(`/categories?page=${page}&limit=${limit}`)
  return response.data
}

export const createCategory = async (payload: CategoryPayload): Promise<Category> => {
  const response = await apiClient.post<Category>("/admin/categories", payload)
  return response.data
}

export const updateCategory = async (id: number, payload: CategoryPayload): Promise<Category> => {
  const response = await apiClient.put<Category>(`/admin/categories/${id}`, payload)
  return response.data
}

export const deleteCategory = async (id: number): Promise<void> => {
  await apiClient.delete(`/admin/categories/${id}`)
}
