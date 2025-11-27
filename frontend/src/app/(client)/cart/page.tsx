"use client"

import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, ArrowRight } from "lucide-react"
import { Playfair_Display } from "next/font/google"

import { Button } from "@/components/ui/button"
import { useBoundStore } from "@/zustand/total"
import { formatCurrencyVND } from "@/lib/utils"
import SuggestedProducts from "@/components/SuggestedProducts"

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
})

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart } = useBoundStore()

  const subtotal = (cartItems || []).reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  )

  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <h1
        className={`${playfair.className} mb-12 text-center text-4xl font-semibold text-gray-800 md:text-6xl`}
      >
        Shopping Cart
      </h1>

      {/* Cart List */}
      {(cartItems || []).length > 0 ? (
        <div className="grid gap-8 lg:grid-cols-3 lg:gap-16">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="mb-4 hidden grid-cols-5 items-center gap-4 border-b pb-4 font-semibold md:grid">
              <div className="col-span-2">Món ăn</div>
              <div className="text-center">Giá tiền</div>
              <div className="text-center">Số lương</div>
              <div className="text-right">Tổng</div>
            </div>
            {(cartItems || []).map((item) => (
              <div
                key={item.product.id}
                className="flex flex-col gap-4 border-b py-4 md:grid md:grid-cols-5 md:items-center"
              >
                <div className="col-span-2 flex items-center gap-4">
                  <Image
                    src={item.product.image}
                    alt={item.product.name}
                    width={80}
                    height={80}
                    className="h-20 w-20 rounded-md object-cover"
                  />
                  <div>
                    <p className="font-semibold">{item.product.name}</p>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-sm text-red-500 hover:underline"
                    >
                      Xoá
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between md:block md:text-center">
                  <span className="font-medium md:hidden">Giá:</span>
                  <p>{formatCurrencyVND(item.product.price)}</p>
                </div>

                <div className="flex items-center justify-between md:justify-center">
                  <span className="font-medium md:hidden">Số lượng:</span>
                  <div className="flex w-fit items-center rounded-full border">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    >
                      <Minus size={14} />
                    </Button>
                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    >
                      <Plus size={14} />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between md:block md:text-right">
                  <span className="font-medium md:hidden">Tổng:</span>
                  <p className="font-semibold">
                    {formatCurrencyVND(item.product.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="h-fit rounded-lg bg-gray-50 p-8 shadow-sm">
            <h2 className="mb-6 text-2xl font-semibold">Đơn hàng của bạn</h2>
            <div className="mb-4 flex justify-between text-gray-600">
              <span>Chi phí</span>
              <span>{formatCurrencyVND(subtotal)}</span>
            </div>
            <div className="mb-6 flex justify-between text-gray-600">
              <span>Vận chuyển:</span>
              <span>Miễn phí</span>
            </div>
            <div className="flex justify-between border-t pt-4 text-xl font-bold">
              <span>Tổng tiền</span>
              <span>{formatCurrencyVND(subtotal)}</span>
            </div>
            <Button asChild size="lg" className="mt-8 w-full bg-black hover:bg-gray-800">
              <Link href="/checkout">
                Thanh toán <ArrowRight size={20} className="ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="py-16 text-center">
          <p className="mb-4 text-xl text-gray-600">Giỏ hàng trống</p>
          <Button asChild>
            <Link href="/menu">Tiếp tục đặt món</Link>
          </Button>
        </div>
      )}

      <SuggestedProducts />
    </div>
  )
}

export default CartPage
