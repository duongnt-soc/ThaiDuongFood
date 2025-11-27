import { StateCreator } from "zustand"
import { toast } from "sonner"

import {
  addToCartDB,
  fetchCartFromDB,
  removeFromCartDB,
  updateQuantityDB,
  clearCartDB,
} from "@/api/cart"

import { AccountInfoSlice } from "./accountInfo"
import { UISlice } from "./uiStore"

export interface CartProduct {
  id: number
  name: string
  price: number
  image: string
  slug: string
}

export interface CartItem {
  product: CartProduct
  quantity: number
}

export interface CartSlice {
  cartItems: CartItem[]
  fetchCart: () => Promise<void>
  addToCart: (item: CartProduct, quantity: number) => Promise<void>
  removeFromCart: (productId: number) => Promise<void>
  updateQuantity: (productId: number, newQuantity: number) => Promise<void>
  clearCart: () => void
}

export const createCartSlice: StateCreator<
  AccountInfoSlice & CartSlice & UISlice,
  [],
  [],
  CartSlice
> = (set, get) => ({
  cartItems: [],
  fetchCart: async () => {
    try {
      const dbCartItems = await fetchCartFromDB()
      set({ cartItems: dbCartItems })
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu giỏ hàng", error)
      set({ cartItems: [] })
    }
  },

  addToCart: async (item, quantity) => {
    const { accountInfo, openAuthModal } = get()

    if (!accountInfo.id) {
      openAuthModal()
      return
    }

    const currentItems = get().cartItems || []
    const existingItemIndex = currentItems.findIndex((cartItem) => cartItem.product.id === item.id)

    const newCartItems = [...currentItems]
    if (existingItemIndex > -1) {
      newCartItems[existingItemIndex].quantity += quantity
    } else {
      newCartItems.push({ product: item, quantity: quantity })
    }
    set({ cartItems: newCartItems })

    try {
      await addToCartDB(item.id, quantity)
      toast.success(`${quantity} x ${item.name} đã được thêm vào giỏ.`)
    } catch (error) {
      toast.error("Vui lòng đăng nhập để đặt món ăn.")
      console.error("Lỗi khi thêm vào giỏ hàng", error)
      set({ cartItems: currentItems })
    }
  },

  removeFromCart: async (productId) => {
    try {
      await removeFromCartDB(productId)
      set((state) => ({
        cartItems: state.cartItems.filter((item) => item.product.id !== productId),
      }))
      toast.success("Sản phẩm đã được xóa khỏi giỏ hàng.")
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm khỏi giỏ hàng", error)
      toast.error("Lỗi khi xóa sản phẩm.")
    }
  },

  updateQuantity: async (productId, newQuantity) => {
    const originalCart = get().cartItems
    const updatedCart = originalCart
      .map((item) => (item.product.id === productId ? { ...item, quantity: newQuantity } : item))
      .filter((item) => item.quantity > 0)

    set({ cartItems: updatedCart })

    try {
      await updateQuantityDB(productId, newQuantity)
    } catch (error) {
      toast.error("Lỗi khi cập nhật số lượng.")
      set({ cartItems: originalCart })
      console.error(error)
    }
  },
  clearCart: async () => {
    try {
      await clearCartDB()
      set({ cartItems: [] })
    } catch (error) {
      console.error("Lỗi khi dọn dẹp giỏ hàng trên server:", error)
    }
  },
})
