import { Voucher, UserVoucher, MessageResponse } from "@/types/api"
import { VoucherFormValues } from "@/app/(admin)/vouchers/VoucherForm"

import apiClient from "."

const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken")
  return { Authorization: `Bearer ${token}` }
}

export type VoucherApiPayload = Omit<
  VoucherFormValues,
  "hunt_start_time" | "hunt_end_time" | "applicable_product_ids"
> & {
  hunt_start_time: string
  hunt_end_time: string
  applicable_product_ids: number[]
}

export const adminGetAllVouchers = async (page: number = 1, limit: number = 10) => {
  const response = await apiClient.get(`/admin/vouchers?page=${page}&limit=${limit}`)
  return response.data
}

export const adminCreateVoucher = async (payload: VoucherApiPayload): Promise<{ id: number }> => {
  const response = await apiClient.post<{ id: number }>("/admin/vouchers", payload, {
    headers: getAuthHeaders(),
  })
  return response.data
}

export const adminUpdateVoucher = async (
  id: number,
  payload: VoucherApiPayload
): Promise<MessageResponse> => {
  const response = await apiClient.put<MessageResponse>(`/admin/vouchers/${id}`, payload, {
    headers: getAuthHeaders(),
  })
  return response.data
}

export const adminDeleteVoucher = async (id: number): Promise<MessageResponse> => {
  const response = await apiClient.delete<MessageResponse>(`/admin/vouchers/${id}`, {
    headers: getAuthHeaders(),
  })
  return response.data
}

export const getClaimableVouchers = async (): Promise<Voucher[]> => {
  const response = await apiClient.get<Voucher[]>("/user/vouchers/claimable", {
    headers: getAuthHeaders(),
  })
  return response.data
}

export const claimVoucher = async (voucherId: number): Promise<MessageResponse> => {
  const response = await apiClient.post<MessageResponse>(
    `/user/vouchers/claim/${voucherId}`,
    {},
    { headers: getAuthHeaders() }
  )
  return response.data
}

export const getUserVouchers = async (showUsed: boolean = false): Promise<UserVoucher[]> => {
  const response = await apiClient.get<UserVoucher[]>(`/user/vouchers?show_used=${showUsed}`, {
    headers: getAuthHeaders(),
  })
  return response.data
}

export const deleteUserVoucher = async (userVoucherId: number): Promise<MessageResponse> => {
  const response = await apiClient.delete<MessageResponse>(`/user/vouchers/${userVoucherId}`, {
    headers: getAuthHeaders(),
  })
  return response.data
}
