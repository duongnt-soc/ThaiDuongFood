import { Review, ReviewPayload, PaginatedReviews } from "@/types/api"

import apiClient from "."

export const getReviews = async (productId: number): Promise<Review[]> => {
  const response = await apiClient.get<Review[]>(`/products/${productId}/reviews`)
  return response.data
}

export const submitReview = async (productId: number, payload: ReviewPayload): Promise<Review> => {
  const token = localStorage.getItem("authToken")
  const response = await apiClient.post<Review>(`/user/products/${productId}/reviews`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

export const updateReview = async (reviewId: number, payload: ReviewPayload): Promise<any> => {
  const token = localStorage.getItem("authToken")
  const response = await apiClient.put(`/user/reviews/${reviewId}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

export const replyToReview = async (reviewId: number, reply: string): Promise<any> => {
  // const token = localStorage.getItem("authToken");
  const response = await apiClient.put(`/admin/reviews/${reviewId}/reply`, { reply })
  return response.data
}

export const adminGetAllReviews = async (page: number = 1): Promise<PaginatedReviews> => {
  const response = await apiClient.get<PaginatedReviews>(`/admin/reviews?page=${page}`)
  return response.data
}

export const adminReplyToReview = async (reviewId: number, reply: string): Promise<any> => {
  return apiClient.put(`/admin/reviews/${reviewId}/reply`, { reply })
}

export const adminDeleteReview = async (reviewId: number): Promise<void> => {
  await apiClient.delete(`/admin/reviews/${reviewId}`)
}
