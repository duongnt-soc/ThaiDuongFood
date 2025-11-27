import { ChatbotResponse, ChatMessage, UserProfile } from "@/types/api"

import apiClient from "."


interface CartItemPayload {
  product_id: number
  quantity: number
}

export const getChatbotResponse = async (
  cartItems: CartItemPayload[],
  history: ChatMessage[],
  userProfile?: Partial<UserProfile>
): Promise<ChatbotResponse> => {
  const response = await apiClient.post<ChatbotResponse>("/chatbot/conversation", {
    cart_items: cartItems,
    history: history.map((msg) => ({
      role: msg.sender === "bot" ? "model" : "user",
      content: msg.text,
    })),
    user_profile: userProfile,
  })
  return response.data
}
