"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Playfair_Display } from "next/font/google"

import Main from "@/app/layouts/main"
import { login } from "@/api/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useBoundStore } from "@/zustand/total"
import { Account } from "@/types/account"

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
})

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { saveAccountInfo, fetchCart } = useBoundStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await login({ username, password })

      const { token, is_admin, ...userData } = response

      // Save information to Zustand
      const accountInfo: Account = {
        id: userData.id.toString(),
        username: userData.username,
        email: userData.email,
        isAdmin: is_admin,
      }
      saveAccountInfo(accountInfo)

      localStorage.setItem("authToken", token)

      await fetchCart()

      toast.success("Đăng nhập thành công!")

      if (is_admin) {
        router.push("/dashboard")
      } else {
        router.push("/")
      }
    } catch (error) {
      toast.error("Tên đăng nhập hoặc mật khẩu không hợp lệ. Vui lòng thử lại.")
      console.error("Login failed:", error)
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
          <h1 className={`${playfair.className} mb-8 text-center text-4xl font-semibold`}>
            Đăng nhập
          </h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="mb-2 block text-sm font-medium">
                Username
              </label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your username"
                required
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="mb-2 block text-sm font-medium">
                  Password
                </label>
                <Link href="/forgot-password" className="text-sm font-medium text-[#AD343E] hover:underline">
                  Quên mật khẩu?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-600">
            Bạn chưa có tài khoản?{" "}
            <Link href="/register" className="font-medium text-[#AD343E] hover:underline">
              Đăng ký
            </Link>
          </p>
        </div>
      </div>
    </Main>
  )
}
