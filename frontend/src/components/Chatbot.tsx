"use client"

import { useState, useRef, useEffect } from "react"
import { MessageCircleCode, Send, X, Loader2, Settings } from "lucide-react"

import { useBoundStore } from "@/zustand/total"
import { getChatbotResponse } from "@/api/chatbot"
import { ChatMessage, UserProfile } from "@/types/api"

import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [showSettings, setShowSettings] = useState(true)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "bot",
      text: "Chào bạn! Tôi là trợ lý dinh dưỡng. Hãy cho tôi biết thêm về bạn ở dưới để nhận được lời khuyên tốt nhất nhé!",
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const [userProfile, setUserProfile] = useState<Partial<UserProfile>>({})

  const { cartItems } = useBoundStore()
  const messagesEndRef = useRef<null | HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    if (value === "") {
      setUserProfile((prev) => {
        const newProfile = { ...prev }
        delete newProfile[name as keyof UserProfile]
        return newProfile
      })
    } else {
      const num = parseInt(value, 10)
      if (!isNaN(num)) {
        setUserProfile((prev) => ({ ...prev, [name]: num }))
      }
    }
  }

  const handleSendMessage = async () => {
    if (inputValue.trim() === "") return

    const userMessage: ChatMessage = { sender: "user", text: inputValue }
    const newHistory = [...messages, userMessage]

    setMessages(newHistory)
    setInputValue("")
    setIsLoading(true)
    setShowSettings(false)

    try {
      const payload = (cartItems || []).map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
      }))

      const response = await getChatbotResponse(payload, newHistory, userProfile)
      setMessages((prev) => [...prev, { sender: "bot", text: response.message }])
    } catch (error) {
      console.error("Chatbot API failed:", error)
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Xin lỗi, tôi không thể trả lời ngay lúc này." },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-[#AD343E] text-white shadow-lg transition-transform hover:scale-110"
      >
        <MessageCircleCode size={32} />
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex h-[550px] w-80 flex-col rounded-lg bg-white shadow-2xl transition-all">
      <div className="flex items-center justify-between rounded-t-lg bg-[#474747] p-4 text-white">
        <h3 className="font-bold">Trợ lý Dinh dưỡng</h3>
        <div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="mr-2 rounded-full p-1 hover:bg-white/20"
          >
            <Settings size={18} />
          </button>
          <button onClick={() => setIsOpen(false)} className="rounded-full p-1 hover:bg-white/20">
            <X size={20} />
          </button>
        </div>
      </div>
      <div className="flex-grow space-y-4 overflow-y-auto p-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.sender === "bot" ? "justify-start" : "justify-end"}`}
          >
            <p
              className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${msg.sender === "bot" ? "bg-gray-200" : "bg-[#AD343E] text-white"}`}
            >
              {msg.text}
            </p>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {showSettings && (
        <div className="space-y-2 border-t bg-gray-50 p-4 text-sm">
          <h4 className="text-center font-semibold">Thông tin của bạn</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="weight_kg">Cân nặng (kg)</Label>
              <Input
                id="weight_kg"
                name="weight_kg"
                type="number"
                onChange={handleProfileChange}
                className="h-8"
              />
            </div>
            <div>
              <Label htmlFor="height_cm">Chiều cao (cm)</Label>
              <Input
                id="height_cm"
                name="height_cm"
                type="number"
                onChange={handleProfileChange}
                className="h-8"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="health_conditions">Bệnh lý (nếu có)</Label>
            <Input
              id="health_conditions"
              name="health_conditions"
              placeholder="sỏi thận, tiểu đường..."
              onChange={handleProfileChange}
              className="h-8"
            />
          </div>
          <div>
            <Label htmlFor="dietary_preference">Sở thích</Label>
            <Input
              id="dietary_preference"
              name="dietary_preference"
              placeholder="Đồ ít ngọt, mặn..."
              onChange={handleProfileChange}
              className="h-8"
            />
          </div>
        </div>
      )}

      <div className="flex gap-2 border-t p-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Nhập tin nhắn..."
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          disabled={isLoading}
        />
        <Button onClick={handleSendMessage} disabled={isLoading}>
          <Send size={16} />
        </Button>
      </div>
    </div>
  )
}
