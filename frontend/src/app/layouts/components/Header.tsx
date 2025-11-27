"use client"

import React, { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Playfair_Display } from "next/font/google"
import Link from "next/link"
import Image from "next/image"
import {
  Phone,
  Mail,
  ShoppingCart,
  CircleUser,
  Menu as MenuIcon,
  Search,
  LogIn,
  UserRoundCheck,
  Headset,
  Trash2,
  LogOut,
  LayoutDashboard,
  History,
  Ticket,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"

import { logout } from "@/api/auth"
import { useBoundStore } from "@/zustand/total"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { searchProductsAI } from "@/api/products"
import { Product } from "@/types/api"
import { formatCurrencyVND } from "@/lib/utils"
import useDebounce from "@/hooks/useDebounce"

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
})

const navLinks = [
  { href: "/", label: "Trang chủ" },
  { href: "/about", label: "Giới thiệu" },
  { href: "/menu", label: "Thực đơn" },
  { href: "/blog", label: "Bài viết" },
  { href: "/contact", label: "Liên hệ" },
]

export default function Header() {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<Product[]>([])
  const { cartItems, removeFromCart, accountInfo, removeAccountInfo, clearCart } = useBoundStore()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const [debouncedQuery, , setDebouncedValue] = useDebounce<string>("", 400)
  const [isSuggestLoading, setIsSuggestLoading] = useState(false)

  const totalItems = (cartItems || []).reduce((total, item) => total + item.quantity, 0)

  const subtotal = (cartItems || []).reduce((total, item) => {
    const price = Number(item.product?.price) || 0
    return total + price * item.quantity
  }, 0)

  useEffect(() => {
    const fetchSuggestions = async () => {
      // Chỉ tìm khi query đủ dài (ít nhất 2 ký tự) và không phải khoảng trắng
      if (debouncedQuery.trim().length > 1) {
        setIsSuggestLoading(true)
        try {
          // Gọi API tìm kiếm AI mới
          const results = await searchProductsAI(debouncedQuery.trim(), 5)
          setSuggestions(results)
        } catch (error) {
          console.error("AI Search suggestions failed:", error)
          setSuggestions([])
        } finally {
          setIsSuggestLoading(false)
        }
      } else {
        setSuggestions([])
        setIsSuggestLoading(false)
      }
    }

    fetchSuggestions()
  }, [debouncedQuery])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setDebouncedValue(value)
  }

  const handleSuggestionClick = (slug: string) => {
    router.push(`/products/${slug}`)
    setIsSearchOpen(false)
    setSuggestions([])
    setQuery("")
    setDebouncedValue("")
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/menu?search=${encodeURIComponent(query.trim())}&ai_search=true`)
      setIsSearchOpen(false)
      setSuggestions([])
      setQuery("")
      setDebouncedValue("")
    }
  }

  const handleMobileLinkClick = (href: string) => {
    router.push(href)
    setIsMobileMenuOpen(false)
  }

  const handleLogout = async () => {
    try {
      await logout()
      clearCart()
    } catch (error) {
      console.error("Logout API call failed, proceeding with client-side logout.", error)
    } finally {
      localStorage.removeItem("authToken")
      removeAccountInfo()
      toast.success("Đăng xuất thành công.")
      router.push("/")
    }
  }

  return (
    <header className="bg-white shadow-sm">
      {/* Topbar */}
      <div className="flex items-center justify-between bg-[#474747] px-4 py-2 text-sm md:px-32">
        <div className="flex flex-wrap items-center gap-4 md:gap-6">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-white" />
            <span className="text-white">+84 967083126</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-white" />
            <span className="text-white">duongnt@hn.soc.one</span>
          </div>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Image key={i} src={`/assets/${i}.png`} width={20} height={20} alt="" />
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 md:px-32">
        {/* Logo */}
        <div className="flex max-w-60 items-center gap-2">
          <Image src={"/assets/logo.png"} width={40} height={40} alt="Logo" />
          <h1 className={`${playfair.className} text-3xl italic text-gray-700 md:text-4xl`}>
            Thai Duong
          </h1>
        </div>

        {/* Nav menu (desktop) */}
        <ul className="hidden gap-1 text-base font-medium text-gray-600 md:flex md:text-lg">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`group relative py-[25px] transition-colors hover:text-black lg:px-4 ${
                  pathname === link.href ? "font-medium text-black" : ""
                }`}
              >
                {link.label}
                <span
                  className={
                    `absolute bottom-0 left-0 block h-0.5 w-full bg-[#AD343E] transition-transform duration-300 ease-out ` +
                    (pathname === link.href
                      ? "scale-x-100"
                      : "origin-right scale-x-0 group-hover:origin-left group-hover:scale-x-100")
                  }
                ></span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Icons */}
        <div className="flex items-center justify-end gap-4 md:w-60">
          {/* Search sidebar */}
          <Sheet open={isSearchOpen} onOpenChange={setIsSearchOpen}>
            <SheetTrigger asChild>
              <Search className="cursor-pointer" />
            </SheetTrigger>
            <SheetContent side="top" className="">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Image src={"/assets/logo.png"} width={40} height={40} alt="Logo" />
                  <span className={`${playfair.className} text-xl italic md:text-3xl`}>
                    Thai Duong
                  </span>
                </SheetTitle>
              </SheetHeader>

              {/* Search input */}
              <form onSubmit={handleSearchSubmit} className="relative mx-auto mt-4 max-w-2xl">
                <div className="flex items-center gap-2">
                  <Input
                    value={query}
                    onChange={handleSearchChange}
                    placeholder="Tìm kiếm món ăn..."
                    className="flex-1"
                    autoFocus
                  />
                  <Button type="submit" disabled={isSuggestLoading || query.trim().length === 0}>
                    {isSuggestLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                    <span className="ml-1 hidden sm:inline">Tìm</span>
                  </Button>
                </div>

                {/* List suggest */}
                {(isSuggestLoading || suggestions.length > 0) && query.trim().length > 1 && (
                  <div className="absolute left-0 top-full z-10 mt-2 max-h-60 w-full overflow-y-auto rounded-md border bg-white shadow-lg">
                    {isSuggestLoading && (
                      <div className="p-4 text-center text-sm text-gray-500">Đang tìm...</div>
                    )}
                    {!isSuggestLoading && suggestions.length > 0 && (
                      <ul className="py-1">
                        {suggestions.map((product) => (
                          <li
                            key={product.id}
                            onClick={() => handleSuggestionClick(product.slug)}
                            className="flex cursor-pointer items-center gap-3 px-4 py-2 hover:bg-gray-100"
                          >
                            <Image
                              src={product.image || "/assets/placeholder.png"}
                              alt={product.name}
                              width={40}
                              height={40}
                              className="h-10 w-10 flex-shrink-0 rounded object-cover"
                            />
                            <span className="flex-grow truncate text-sm">{product.name}</span>
                            <span className="ml-2 flex-shrink-0 text-sm font-semibold text-[#AD343E]">
                              {formatCurrencyVND(product.price)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {!isSuggestLoading && suggestions.length === 0 && query.trim().length > 1 && (
                      <div className="p-4 text-center text-sm text-gray-500">
                        Không tìm thấy kết quả.
                      </div>
                    )}
                  </div>
                )}
              </form>
            </SheetContent>
          </Sheet>

          {/* Cart sidebar */}
          <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
            <SheetTrigger asChild>
              <div className="relative cursor-pointer">
                <ShoppingCart />
                {totalItems > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#AD343E] text-xs text-white">
                    {totalItems}
                  </span>
                )}
              </div>
            </SheetTrigger>
            <SheetContent side="right" className="flex w-80 flex-col sm:w-96">
              <SheetHeader>
                <SheetTitle>Giỏ hàng của bạn ({totalItems})</SheetTitle>
              </SheetHeader>
              {cartItems && cartItems.length > 0 ? (
                <>
                  <div className="flex-grow overflow-y-auto pr-4">
                    {cartItems
                      .filter((item) => item && item.product)
                      .map((item) => (
                        <div key={item.product.id} className="flex gap-4 border-b py-4">
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            width={64}
                            height={64}
                            className="h-16 w-16 rounded-md object-cover"
                          />
                          <div className="flex-grow">
                            <p className="font-semibold">{item.product.name}</p>
                            <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                            <p className="mt-1 font-semibold">
                              {formatCurrencyVND(item.product.price)}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFromCart(item.product.id)}
                          >
                            <Trash2 size={16} className="text-gray-500" />
                          </Button>
                        </div>
                      ))}
                  </div>
                  <div className="border-t pt-4">
                    <div className="mb-4 flex justify-between text-lg font-bold">
                      <span>Tổng tiền</span>
                      <span>{formatCurrencyVND(subtotal)}</span>
                    </div>
                    <div className="flex flex-col gap-3">
                      <Button
                        asChild
                        className="w-full bg-[#AD343E] hover:bg-[#932b34]"
                        onClick={() => setIsCartOpen(false)}
                      >
                        <Link href="/checkout">Thanh toán</Link>
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        className="w-full border-[#AD343E] hover:text-[#932b34]"
                        onClick={() => setIsCartOpen(false)}
                      >
                        <Link href="/cart" className="text-[#AD343E] hover:text-[#932b34]">
                          Xem giỏ hàng
                        </Link>
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="mt-4 flex flex-grow items-center justify-center text-center text-gray-600">
                  Giỏ hàng trống
                </div>
              )}
            </SheetContent>
          </Sheet>

          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <CircleUser className="cursor-pointer" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {accountInfo.username ? (
                <>
                  <DropdownMenuLabel>Xin chào, {accountInfo.username}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {accountInfo.isAdmin && (
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => router.push(" /dashboard")}
                    >
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Trang Quản Trị
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/cart")}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Giỏ hàng của bạn
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => router.push("/my-vouchers")}
                  >
                    <Ticket className="mr-2 h-4 w-4" />
                    Ví voucher
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => router.push("/order-history")}
                  >
                    <History className="mr-2 h-4 w-4" />
                    Lịch sử đặt hàng
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Đăng xuất
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => router.push("/login")}
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    Đăng nhập
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => router.push("/register")}
                  >
                    <UserRoundCheck className="mr-2 h-4 w-4" />
                    Đăng ký
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <Headset className="mr-2 h-4 w-4" />
                Hỗ trợ
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile menu sidebar */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <button className="md:hidden">
                <MenuIcon className="h-6 w-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <SheetHeader>
                <SheetTitle className={`${playfair.className} text-2xl`}>Menu</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-4 text-lg font-medium text-gray-700">
                {navLinks.map((link) => (
                  <Button
                    key={link.href}
                    variant="ghost"
                    className={`justify-start p-0 text-lg transition-colors hover:text-black ${
                      pathname === link.href ? "font-bold text-[#AD343E]" : ""
                    }`}
                    onClick={() => handleMobileLinkClick(link.href)}
                  >
                    {link.label}
                  </Button>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
