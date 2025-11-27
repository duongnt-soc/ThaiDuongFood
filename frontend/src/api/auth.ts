import { LoginRequest, LoginResponse, RegisterRequest, ForgotPasswordRequest, ResetPasswordRequest } from "@/types/api"

import apiClient from "."


export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>("/auth/login", credentials)
  return response.data
}

export const register = async (userInfo: RegisterRequest) => {
  const response = await apiClient.post("/auth/register", userInfo)
  return response.data
}

export const logout = async () => {
  const token = localStorage.getItem("authToken")
  const response = await apiClient.post(
    "/auth/logout",
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
  return response.data
}

export const forgotPassword = async (data: ForgotPasswordRequest): Promise<any> => {
  const response = await apiClient.post("/auth/forgot-password", data)
  return response.data
}

export const resetPassword = async (data: ResetPasswordRequest): Promise<any> => {
  const response = await apiClient.post("/auth/reset-password", data)
  return response.data
}
