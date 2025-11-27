// src/app/(auth)/forgot-password/page.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Playfair_Display } from "next/font/google"

import Main from "@/app/layouts/main"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { forgotPassword } from "@/api/auth"

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
})

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await forgotPassword({ email })
      setIsSubmitted(true)
    } catch (error) {
      console.error("Error in forgot password:", error)
      toast.error("Đã có lỗi xảy ra. Vui lòng thử lại.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Main>
      <div
        className="mx-auto flex min-h-[70vh] items-center justify-center px-4 py-16"
        style={{
          backgroundImage: "url('/food/banner.webp')",
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundColor: "rgba(0,0,0,0.5)",
          backgroundBlendMode: "darken",
        }}
      >
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
          {isSubmitted ? (
            <div className="text-center">
              <h1 className={`${playfair.className} mb-4 text-3xl font-semibold`}>
                Kiểm tra Email
              </h1>
              <p className="text-gray-600">
                Nếu tài khoản của bạn tồn tại, một liên kết để đặt lại mật khẩu đã được gửi đến{" "}
                {email}.
              </p>
              <Link href="/login">
                <Button className="mt-6 w-full">Quay lại Đăng nhập</Button>
              </Link>
            </div>
          ) : (
            <>
              <h1 className={`${playfair.className} mb-8 text-center text-4xl font-semibold`}>
                Quên Mật khẩu
              </h1>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Đang gửi..." : "Gửi liên kết đặt lại"}
                </Button>
              </form>
              <p className="mt-6 text-center text-sm text-gray-600">
                Nhớ mật khẩu?{" "}
                <Link href="/login" className="font-medium text-[#AD343E] hover:underline">
                  Đăng nhập
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </Main>
  )
}
