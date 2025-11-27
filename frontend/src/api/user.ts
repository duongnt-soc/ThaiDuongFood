import { DashboardStats } from "@/types/api"

import apiClient from "."

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await apiClient.get<DashboardStats>("/admin/stats")
  return response.data
}

export const getUsers = async (page: number = 1, limit: number = 10) => {
  const response = await apiClient.get(`/admin/users?page=${page}&limit=${limit}`)
  return response.data
}
