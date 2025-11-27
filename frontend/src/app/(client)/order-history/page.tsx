"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Playfair_Display } from "next/font/google"

import { getOrderHistory } from "@/api/orders"
import { Order } from "@/types/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrencyVND } from "@/lib/utils"

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
})

const getStatusVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "bg-yellow-100 text-yellow-800"
    case "processing":
      return "bg-blue-100 text-blue-800"
    case "shipped":
      return "bg-green-100 text-green-800"
    case "completed":
      return "bg-green-200 text-green-900 font-bold"
    case "cancelled":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getOrderHistory()
        setOrders(data)
      } catch (error) {
        console.error(error)
        toast.error("Please log in to view your order history.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchOrders()
  }, [])

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#AD343E]" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <h1
        className={`${playfair.className} mb-12 text-center text-4xl font-semibold text-gray-800 md:text-6xl`}
      >
        Lịch sử đặt hàng
      </h1>

      {orders.length > 0 ? (
        <div className="mx-auto max-w-4xl space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-lg border bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
                <div>
                  <h2 className="text-lg font-bold">Mã #{order.id}</h2>
                  <p className="text-sm text-gray-500">
                    Ngày: {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge className={getStatusVariant(order.status)}>{order.status}</Badge>
              </div>
              <div className="flex items-center justify-between pt-4">
                <p className="text-gray-600">Tổng tiền</p>
                <p className="text-xl font-bold">{formatCurrencyVND(order.total_amount)}</p>
              </div>
              <Button asChild variant="outline">
                <Link href={`/order-history/${order.id}`}>Xem chi tiết</Link>
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <p className="mb-4 text-xl text-gray-600">Bạn chưa đặt món nào trước đây.</p>
          <Button asChild>
            <Link href="/menu">Bắt đầu đặt món</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
