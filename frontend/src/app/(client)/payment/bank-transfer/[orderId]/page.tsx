"use client"

import { ArrowLeft, Check, Copy, Loader2 } from "lucide-react"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import apiClient from "@/api"
import { Button } from "@/components/ui/button"

interface OrderInfo {
  id: number
  total_amount: number
  customer_name: string
  status: string
}

export default function BankTransferPaymentPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.orderId as string

  const [order, setOrder] = useState<OrderInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)

  // Thông tin tài khoản Techcombank
  const bankInfo = {
    bankName: "Techcombank",
    accountNumber: "19072027706012",
    accountName: "NGUYEN THAI DUONG",
    amount: order?.total_amount || 0,
    content: `DH${orderId}`,
  }

  const fetchOrderInfo = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.get(`/orders/${orderId}/status`)
      setOrder(response.data)
    } catch (error) {
      console.error("Error fetching order:", error)
      toast.error("Không thể tải thông tin đơn hàng")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchOrderInfo()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId])

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopied(field)
    toast.success("Đã sao chép!")
    setTimeout(() => setCopied(null), 2000)
  }

  const checkPaymentStatus = async () => {
    setIsCheckingStatus(true)
    try {
      const response = await apiClient.get(`/orders/${orderId}/status`)
      if (response.data.status === "processing" || response.data.status === "paid") {
        toast.success("Thanh toán thành công!")
        router.push("/")
      } else {
        toast.info("Chưa nhận được thanh toán. Vui lòng thử lại sau.")
      }
    } catch {
      toast.error("Không thể kiểm tra trạng thái")
    } finally {
      setIsCheckingStatus(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-lg text-gray-600">Không tìm thấy đơn hàng</p>
        <Button onClick={() => router.push("/")}>Về trang chủ</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <Button variant="ghost" onClick={() => router.push("/")} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Về trang chủ
        </Button>

        <div className="rounded-lg bg-white p-6 shadow-lg md:p-8">
          <div className="mb-6 text-center">
            <h1 className="mb-2 text-2xl font-bold text-gray-900">Thanh toán chuyển khoản</h1>
            <p className="text-gray-600">Đơn hàng #{orderId}</p>
            <div className="mt-4 inline-block rounded-lg bg-yellow-100 px-4 py-2 text-yellow-800">
              Trạng thái: Chờ thanh toán
            </div>
          </div>

          {/* QR Code */}
          <div className="mb-6 flex justify-center">
            <div className="rounded-lg border-4 border-gray-200 p-4">
              <Image
                src="/images/qr.jpg"
                alt="QR Code Techcombank"
                width={300}
                height={300}
                className="rounded"
              />
            </div>
          </div>

          {/* Thông tin chuyển khoản */}
          <div className="mb-6 space-y-4">
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-gray-600">Ngân hàng</span>
                <span className="font-semibold">{bankInfo.bankName}</span>
              </div>

              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-gray-600">Số tài khoản</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{bankInfo.accountNumber}</span>
                  <button
                    onClick={() => handleCopy(bankInfo.accountNumber, "account")}
                    className="rounded p-1 hover:bg-gray-200"
                  >
                    {copied === "account" ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4 text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-gray-600">Chủ tài khoản</span>
                <span className="font-semibold">{bankInfo.accountName}</span>
              </div>

              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-gray-600">Số tiền</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-red-600">
                    {bankInfo.amount.toLocaleString("vi-VN")} VND
                  </span>
                  <button
                    onClick={() => handleCopy(bankInfo.amount.toString(), "amount")}
                    className="rounded p-1 hover:bg-gray-200"
                  >
                    {copied === "amount" ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4 text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Nội dung</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-blue-600">{bankInfo.content}</span>
                  <button
                    onClick={() => handleCopy(bankInfo.content, "content")}
                    className="rounded p-1 hover:bg-gray-200"
                  >
                    {copied === "content" ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4 text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Hướng dẫn */}
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h3 className="mb-2 font-semibold text-blue-900">Hướng dẫn thanh toán:</h3>
            <ol className="list-inside list-decimal space-y-1 text-sm text-blue-800">
              <li>Mở ứng dụng ngân hàng của bạn</li>
              <li>Quét mã QR hoặc nhập thông tin chuyển khoản</li>
              <li>Nhập đúng số tiền và nội dung chuyển khoản</li>
              <li>Xác nhận giao dịch</li>
              <li>Chờ admin xác nhận (thường trong vòng 5-10 phút)</li>
            </ol>
          </div>

          {/* Nút kiểm tra */}
          <Button
            onClick={checkPaymentStatus}
            disabled={isCheckingStatus}
            className="w-full"
            size="lg"
          >
            {isCheckingStatus ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang kiểm tra...
              </>
            ) : (
              "Tôi đã chuyển khoản"
            )}
          </Button>

          <p className="mt-4 text-center text-sm text-gray-500">
            Sau khi chuyển khoản, vui lòng chờ admin xác nhận thanh toán
          </p>
        </div>
      </div>
    </div>
  )
}
