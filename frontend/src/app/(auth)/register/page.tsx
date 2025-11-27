"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Playfair_Display } from "next/font/google"
import axios from "axios"

import Main from "@/app/layouts/main"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
})

export default function RegisterPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await axios.post("http://localhost:8080/api/auth/register", {
        username,
        email,
        password,
      })

      toast.success("Đăng ký thành công! Vui lòng đăng nhập.")
      router.push("/login")
    } catch (error) {
      toast.error("Đăng ký thất bại. Tên người dùng hoặc email có thể đã tồn tại.")
      console.error("Registration failed:", error)
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
            Đăng ký
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
              <label htmlFor="password" className="mb-2 block text-sm font-medium">
                Password
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
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Đang đăng ký..." : "Đăng ký"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-600">
            Bạn đã có tài khoản?{" "}
            <Link href="/login" className="font-medium text-[#AD343E] hover:underline">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </Main>
  )
}
