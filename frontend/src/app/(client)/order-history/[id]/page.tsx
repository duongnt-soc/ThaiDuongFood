"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { toast } from "sonner"
import { Loader2, ArrowLeft } from "lucide-react"
import { Playfair_Display } from "next/font/google"

import { getOrderDetails } from "@/api/orders"
import { Order } from "@/types/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrencyVND } from "@/lib/utils"

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
})

const getStatusVariant = (status: string): string => {
  switch (status?.toLowerCase()) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "processing":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "shipped":
      return "bg-indigo-100 text-indigo-800 border-indigo-200"
    case "completed":
      return "bg-green-100 text-green-800 border-green-200"
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = Number(params.id)
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (orderId && !isNaN(orderId)) {
      const fetchOrderDetails = async () => {
        try {
          const data = await getOrderDetails(orderId)
          setOrder(data)
        } catch (error) {
          console.error("Error fetching order details:", error)
          toast.error("Could not fetch order details.")
        } finally {
          setIsLoading(false)
        }
      }
      fetchOrderDetails()
    } else {
      setIsLoading(false)
      toast.error("Invalid Order ID.")
    }
  }, [orderId])

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#AD343E]" />
      </div>
    )
  }

  if (!order) {
    return <div className="py-24 text-center">Đơn hàng không tồn tại.</div>
  }

  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Quay lại
      </Button>
      <h1 className={`${playfair.className} mb-4 text-3xl font-bold`}>Chi tiết đơn hàng</h1>
      <p className="mb-8 text-gray-500">
        Mã #{order.id} - Đặt vào {new Date(order.created_at).toLocaleDateString()}
      </p>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-xl font-semibold">Món ăn đã đặt trong đơn:</h2>
          <div className="space-y-4 rounded-lg border">
            {order.items?.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4 hover:bg-gray-50">
                <Image
                  src={item.product_image || "/assets/logo.png"}
                  alt={item.product_name}
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-md border object-cover"
                />
                <div className="flex-grow">
                  <p className="font-semibold">{item.product_name}</p>
                  <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                </div>
                <p className="font-semibold">
                  {formatCurrencyVND(item.price_at_purchase * item.quantity)}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="h-fit rounded-lg bg-gray-50 p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Chi tiết đơn hàng</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Trạng thái:</span>{" "}
              <Badge className={getStatusVariant(order.status)}>{order.status}</Badge>
            </div>
            <div className="mt-2 flex justify-between border-t pt-2 text-lg font-bold">
              <span>Tổng:</span> <span>{order.total_amount.toFixed(2)}</span>
            </div>
          </div>
          <h3 className="mb-2 mt-6 font-semibold">Địa chỉ:</h3>
          <p className="text-sm text-gray-600">
            {order.customer_name}
            <br />
            {order.shipping_address}
          </p>
        </div>
      </div>
    </div>
  )
}
