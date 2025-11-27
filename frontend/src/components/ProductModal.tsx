"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Minus, Plus, ShoppingCart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useBoundStore } from "@/zustand/total"
import { formatCurrencyVND } from "@/lib/utils" 
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

import { SliderItem } from "./ReusableSlider"

interface ProductModalProps {
  product: SliderItem | null
  isOpen: boolean
  onClose: () => void
}

const ProductModal: React.FC<ProductModalProps> = ({ product, isOpen, onClose }) => {
  const [quantity, setQuantity] = useState(1)
  const { addToCart } = useBoundStore()

  if (!product) {
    return null
  }

  const handleQuantityChange = (amount: number) => {
    setQuantity((prev) => Math.max(1, prev + amount))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const num = parseInt(value, 10)

    if (!isNaN(num) && num > 0) {
      setQuantity(num)
    } else if (value === "") {
      setQuantity(1)
    }
  }

  const handleAddToCart = () => {
    const productToAdd = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      slug: product.slug,
    }

    addToCart(productToAdd, quantity)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="grid-cols-1 gap-6 overflow-hidden p-0 sm:max-w-[600px] md:grid-cols-2">
        <div className="relative h-64 md:h-full">
          <Image
            src={product.image}
            alt={product.name}
            fill
            style={{ objectFit: "cover" }}
            className="rounded-t-lg md:rounded-l-lg md:rounded-t-none"
          />
        </div>
        <div className="flex flex-col p-6">
          <DialogHeader>
            <DialogTitle className="mb-2 text-2xl font-bold">{product.name}</DialogTitle>
            <DialogDescription className="text-lg font-semibold text-red-600">
              {formatCurrencyVND(product.price)}
            </DialogDescription>
          </DialogHeader>
          <p className="my-4 flex-grow text-gray-600">
            Một món {product.name.toLowerCase()} thơm ngon và tươi mới. Được làm từ những nguyên liệu tốt nhất.
          </p>
          <div className="mb-6 flex items-center gap-4">
            <p>Số lương:</p>
            <div className="flex items-center rounded-full border">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full outline-none"
                onClick={() => handleQuantityChange(-1)}
              >
                <Minus size={16} />
              </Button>
              {/* <span className="w-10 text-center font-semibold">{quantity}</span> */}
              <input
                className="w-10 text-center font-semibold outline-none"
                value={quantity}
                onChange={handleInputChange}
                min="1"
              />
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full outline-none"
                onClick={() => handleQuantityChange(1)}
              >
                <Plus size={16} />
              </Button>
            </div>
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-col sm:space-x-0">
            <Button
              asChild
              className="w-full rounded-full border border-black bg-black text-white transition duration-300 ease-in-out hover:scale-105 hover:bg-white hover:text-black active:scale-95"
            >
              <Link href={`/products/${product.slug}`}>Xem chi tiết</Link>
            </Button>
            <Button
              onClick={handleAddToCart}
              className="w-full rounded-full border border-[#AD343E] bg-[#AD343E] transition duration-300 ease-in-out hover:scale-105 hover:bg-white hover:text-[#AD343E] active:scale-95"
            >
              <ShoppingCart size={18} className="mr-2" />
              Thêm vào giỏ
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ProductModal
