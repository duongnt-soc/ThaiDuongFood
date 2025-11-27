// src/app/(auth)/reset-password/[token]/page.tsx
"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Playfair_Display } from "next/font/google"

import Main from "@/app/layouts/main"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { resetPassword } from "@/api/auth"

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
})

export default function ResetPasswordPage() {
  const params = useParams()
  const token = params.token as string

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast.error("Mật khẩu không khớp.")
      return
    }
    setIsLoading(true)

    const payload = { token: token, password: password };

    try {
      await resetPassword(payload);
      setIsSuccess(true)
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Đặt lại mật khẩu thất bại. Token có thể đã hết hạn hoặc không hợp lệ."
      toast.error(errorMessage)
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
          {isSuccess ? (
             <div className="text-center">
              <h1 className={`${playfair.className} mb-4 text-3xl font-semibold`}>
                Thành công!
              </h1>
              <p className="text-gray-600">
                Mật khẩu của bạn đã được đặt lại. Bây giờ bạn có thể đăng nhập bằng mật khẩu mới.
              </p>
              <Link href="/login">
                <Button className="mt-6 w-full">Đi đến trang Đăng nhập</Button>
              </Link>
            </div>
          ) : (
            <>
              <h1 className={`${playfair.className} mb-8 text-center text-4xl font-semibold`}>
                Đặt lại mật khẩu
              </h1>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="password" className="mb-2 block text-sm font-medium">
                    Mật khẩu mới
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                 <div>
                  <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium">
                    Xác nhận mật khẩu mới
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </Main>
  )
}
