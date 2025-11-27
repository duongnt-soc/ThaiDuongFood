"use client"

import { useEffect, useState } from "react"
import { Playfair_Display } from "next/font/google"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle, Loader2, XCircle } from "lucide-react"

import { useBoundStore } from "@/zustand/total"
import { Button } from "@/components/ui/button"

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
})

export default function OrderResultPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { clearCart } = useBoundStore()
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading")

  useEffect(() => {
    const resultCode = searchParams.get("resultCode")
    if (resultCode === "0") {
      setStatus("success")
      clearCart()
    } else if (resultCode) {
      setStatus("failed")
    } else {
      setStatus("failed")
    }
  }, [searchParams, clearCart])

  if (status === "loading") {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="mx-auto h-16 w-16 animate-spin text-[#AD343E]" />
          <p className="mt-4 text-lg text-gray-600">Đang xử lý thanh toán...</p>
        </div>
      </div>
    )
  }

  if (status === "success") {
    return (
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <CheckCircle className="mx-auto h-24 w-24 text-green-500" />
          <h1
            className={`${playfair.className} mt-6 text-4xl font-semibold text-gray-800 md:text-5xl`}
          >
            Thanh toán thành công!
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đang được xử lý.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Bạn có thể xem chi tiết đơn hàng trong mục Order History
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button
              onClick={() => router.push("/order-history")}
              className="bg-[#AD343E] hover:bg-[#932b34]"
            >
              Xem đơn hàng
            </Button>
            <Button onClick={() => router.push("/")} variant="outline">
              Về trang chủ
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <XCircle className="mx-auto h-24 w-24 text-[#AD343E]" />
        <h1
          className={`${playfair.className} mt-6 text-4xl font-semibold text-gray-800 md:text-5xl`}
        >
          Thanh toán không thành công
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Đơn hàng của bạn chưa được thanh toán. Vui lòng thử lại.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          {searchParams.get("message") || "Giao dịch đã bị huỷ hoặc hết hạn"}
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button
            onClick={() => router.push("/checkout")}
            className="bg-[#AD343E] hover:bg-[#932b34]"
          >
            Thử lại
          </Button>
          <Button onClick={() => router.push("/")} variant="outline">
            Về trang chủ
          </Button>
        </div>
      </div>
    </div>
  )
}
