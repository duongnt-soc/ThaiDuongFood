import { OrderPayload } from "@/types/api"

import apiClient from "."

// Pay by COD
export const placeOrder = async (payload: OrderPayload): Promise<any> => {
  const response = await apiClient.post("/orders", payload)
  return response.data
}

// Pay by MoMo
export const createMoMoPayment = async (payload: OrderPayload): Promise<{ payUrl: string }> => {
  const response = await apiClient.post<{ payUrl: string }>("/payment/momo", payload)
  return response.data
}

// Pay by Bank Transfer
export const createBankTransferPayment = async (
  payload: OrderPayload
): Promise<{ orderId: number; amount: number }> => {
  const response = await apiClient.post<{ orderId: number; amount: number }>(
    "/payment/bank-transfer",
    payload
  )
  return response.data
}
