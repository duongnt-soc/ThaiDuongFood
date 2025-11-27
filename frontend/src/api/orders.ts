import { Order, PaginatedOrders } from "@/types/api"

import apiClient from "."

const API_URL = "http://localhost:8080/api"

export const getAllOrders = async (page: number = 1): Promise<PaginatedOrders> => {
  const response = await apiClient.get<PaginatedOrders>(`/admin/orders?page=${page}`)
  return response.data
}

export const updateOrderStatus = async (orderId: number, status: string): Promise<unknown> => {
  const response = await apiClient.put(`/admin/orders/${orderId}/status`, { status })
  return response.data
}

export const getOrderHistory = async (): Promise<Order[]> => {
  const token = localStorage.getItem("authToken")
  if (!token) {
    throw new Error("No auth token found")
  }

  const response = await apiClient.get<Order[]>("/user/orders", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return response.data
}

export const getOrderDetails = async (orderId: number): Promise<Order> => {
  const response = await apiClient.get<Order>(`/admin/orders/${orderId}`)
  return response.data
}

export const exportOrderPDF = async (orderId: number): Promise<Blob> => {
  const response = await fetch(`${API_URL}/user/orders/${orderId}/pdf`, {
    method: "GET",
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error("Failed to export PDF")
  }

  return response.blob()
}

export const adminExportOrderPDF = async (orderId: number): Promise<Blob> => {
  const response = await fetch(`${API_URL}/admin/orders/${orderId}/pdf`, {
    method: "GET",
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error("Failed to export PDF")
  }

  return response.blob()
}
