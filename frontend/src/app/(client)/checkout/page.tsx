"use client"

import { Playfair_Display } from "next/font/google"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { createBankTransferPayment, createMoMoPayment, placeOrder } from "@/api/checkout"
import { getUserVouchers } from "@/api/vouchers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { OrderPayload, UserVoucher } from "@/types/api"
import { useBoundStore } from "@/zustand/total"

import { formatCurrencyVND } from "../../../lib/utils"

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
})

const CheckoutPage = () => {
  const { cartItems, clearCart, accountInfo } = useBoundStore()
  const router = useRouter()
  const [paymentMethod, setPaymentMethod] = useState("cod")
  const [myVouchers, setMyVouchers] = useState<UserVoucher[]>([])
  const [selectedVoucher, setSelectedVoucher] = useState<UserVoucher | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchVouchers = async () => {
      if (accountInfo.id) {
        try {
          const data = await getUserVouchers(false)
          setMyVouchers(data)
        } catch (error) {
          console.error(error)
        }
      }
    }
    fetchVouchers()
  }, [accountInfo.id])

  const subtotal = (cartItems || []).reduce((total, item) => {
    return total + item.product.price * item.quantity
  }, 0)

  let discountAmount = 0
  if (selectedVoucher) {
    if (selectedVoucher.voucher_info.discount_type === "percentage") {
      discountAmount = (subtotal * selectedVoucher.voucher_info.discount_value) / 100
    } else {
      discountAmount = selectedVoucher.voucher_info.discount_value
    }
  }
  const finalTotal = subtotal - discountAmount

  const handlePlaceOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const payload: OrderPayload = {
      user_id: accountInfo.id ? parseInt(accountInfo.id) : null,
      customer_name: formData.get("name") as string,
      customer_phone: formData.get("phone") as string,
      shipping_address: `${formData.get("address")}, ${formData.get("city")}`,
      cart_items: cartItems.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
      })),
      applied_user_voucher_id: selectedVoucher ? selectedVoucher.id : null,
    }

    try {
      if (paymentMethod === "cod") {
        await placeOrder(payload)
        toast.success("Your order has been placed successfully!")
        await clearCart()
        router.push("/")
      } else if (paymentMethod === "momo") {
        const { payUrl } = await createMoMoPayment(payload)
        // await clearCart()
        window.location.href = payUrl
      } else if (paymentMethod === "bank") {
        const { orderId } = await createBankTransferPayment(payload)
        router.push(`/payment/bank-transfer/${orderId}`)
      }
    } catch (error) {
      const err = error as { response?: { data?: { error?: string } } }
      toast.error(err.response?.data?.error || "Failed to place order.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <h1
        className={`${playfair.className} mb-12 text-center text-4xl font-semibold text-gray-800 md:text-6xl`}
      >
        Checkout
      </h1>
      <form onSubmit={handlePlaceOrder} className="grid items-start gap-8 lg:grid-cols-5 lg:gap-16">
        {/* Shipping Details */}
        <div className="rounded-lg bg-white p-8 shadow-sm lg:col-span-3">
          <h2 className="mb-6 text-2xl font-semibold">Thông tin giao hàng</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="name" className="mb-2 block text-sm font-medium">
                Tên Khách Hàng
              </label>
              <Input id="name" name="name" type="text" placeholder="John Doe" required />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="phone" className="mb-2 block text-sm font-medium">
                Số điện thoại
              </label>
              <Input id="phone" name="phone" type="tel" placeholder="09xxxxxxxx" required />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="address" className="mb-2 block text-sm font-medium">
                Địa chỉ
              </label>
              <Input
                id="address"
                name="address"
                type="text"
                placeholder="Số nhà 12, Đường ABC, Phường X, Quận Y"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="city" className="mb-2 block text-sm font-medium">
                Thành phố
              </label>
              <Input id="city" name="city" type="text" placeholder="Ho Chi Minh City" required />
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="rounded-lg bg-gray-50 p-8 shadow-sm lg:col-span-2">
          <h2 className="mb-6 text-2xl font-semibold">Đơn hàng</h2>
          <div className="space-y-4 border-b pb-4">
            {(cartItems || []).map((item) => (
              <div key={item.product.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <Image
                    src={item.product.image}
                    alt={item.product.name}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-md object-cover"
                  />
                  <p>
                    {item.product.name} <span className="text-gray-500">x{item.quantity}</span>
                  </p>
                </div>
                <p className="font-semibold">
                  {formatCurrencyVND(item.product.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <div className="mb-4 border-b py-4">
            <label className="mb-2 block text-sm font-medium">Áp dụng mã giảm giá</label>
            <Select
              onValueChange={(value) => {
                const voucher = myVouchers.find((v) => v.id === parseInt(value)) || null
                setSelectedVoucher(voucher)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn voucher của bạn..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Không sử dụng</SelectItem>
                {myVouchers?.map((uv) => (
                  <SelectItem key={uv.id} value={uv.id.toString()}>
                    {uv.voucher_info.code} - {uv.voucher_info.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mb-2 flex justify-between text-gray-600">
            <span>Tạm tính: </span>
            <span>{formatCurrencyVND(subtotal)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="mb-2 flex justify-between text-green-600">
              <span>Giảm giá: </span>
              <span>- {formatCurrencyVND(discountAmount)}</span>
            </div>
          )}
          <div className="mb-6 flex justify-between text-xl font-bold">
            <span>Tổng tiền:</span>
            <span>{formatCurrencyVND(finalTotal)}</span>
          </div>

          {/* Payment Method */}
          <h3 className="mb-4 text-lg font-semibold">Phương thức thanh toán</h3>
          <div className="space-y-3">
            <div
              onClick={() => setPaymentMethod("cod")}
              className={`flex cursor-pointer items-center rounded-lg border p-4 ${paymentMethod === "cod" ? "border-[#AD343E] ring-2 ring-[#AD343E]" : ""}`}
            >
              <input
                type="radio"
                id="cod"
                name="payment"
                value="cod"
                checked={paymentMethod === "cod"}
                readOnly
                className="h-4 w-4"
              />
              <label htmlFor="cod" className="ml-3 block text-sm font-medium">
                Thanh toán trực tiếp (COD)
              </label>
            </div>
            <div
              onClick={() => setPaymentMethod("momo")}
              className={`flex cursor-pointer items-center rounded-lg border p-4 ${paymentMethod === "momo" ? "border-[#AD343E] ring-2 ring-[#AD343E]" : ""}`}
            >
              <input
                type="radio"
                id="momo"
                name="payment"
                value="momo"
                checked={paymentMethod === "momo"}
                readOnly
                className="h-4 w-4"
              />
              <label htmlFor="momo" className="ml-3 block text-sm font-medium">
                Thanh toán qua ví MoMo
              </label>
              <Image
                src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png"
                alt="MoMo"
                width={24}
                height={24}
                className="ml-auto h-6 w-6"
              />
            </div>
            <div
              onClick={() => setPaymentMethod("bank")}
              className={`flex cursor-pointer items-center rounded-lg border p-4 ${paymentMethod === "bank" ? "border-[#AD343E] ring-2 ring-[#AD343E]" : ""}`}
            >
              <input
                type="radio"
                id="bank"
                name="payment"
                value="bank"
                checked={paymentMethod === "bank"}
                readOnly
                className="h-4 w-4"
              />
              <label htmlFor="bank" className="ml-3 flex-1 text-sm font-medium">
                Chuyển khoản ngân hàng
                <span className="block text-xs text-gray-500">Techcombank - Xác nhận thủ công</span>
              </label>
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            className="mt-6 w-full bg-[#AD343E] py-4 text-base hover:bg-[#932b34]"
            disabled={isLoading || cartItems.length === 0}
          >
            {isLoading ? "Processing..." : "Place Order"}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default CheckoutPage
