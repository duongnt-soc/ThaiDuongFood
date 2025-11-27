"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { toast } from "sonner"
import { Home, LogOut, Users, ShoppingCart, Hamburger, Boxes, Star, Ticket } from "lucide-react"
import { Playfair_Display } from "next/font/google"

import { Button } from "@/components/ui/button"
import { useBoundStore } from "@/zustand/total"

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
})

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { accountInfo, removeAccountInfo } = useBoundStore()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    removeAccountInfo()
    toast.success("Bạn đã đăng xuất thành công.")
    router.push("/")
  }

  const navLinks = [
    { href: "/dashboard", label: "Tổng quan", icon: <Home className="h-4 w-4" /> },
    { href: "/categories", label: "Danh mục", icon: <Boxes className="h-4 w-4" /> },
    { href: "/products", label: "Sản phẩm", icon: <Hamburger className="h-4 w-4" /> },
    { href: "/vouchers", label: "Mã giảm giá", icon: <Ticket className="h-4 w-4" /> },
    { href: "/orders", label: "Đơn hàng", icon: <ShoppingCart className="h-4 w-4" /> },
    { href: "/customers", label: "Khách hàng", icon: <Users className="h-4 w-4" /> },
    { href: "/reviews", label: "Đánh giá", icon: <Star className="h-4 w-4" /> },
  ]

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* --- SIDEBAR --- */}
      <div className="hidden border-r bg-white md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <div className="flex max-w-60 items-center gap-2">
                <Image src={"/assets/logo.png"} width={32} height={32} alt="Logo" />
                <h1 className={`${playfair.className} text-3xl italic text-gray-700`}>
                  Thai Duong
                </h1>
              </div>
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto">
            <nav className="text-md grid items-start gap-2 px-2 py-4 font-medium lg:px-4">
              {navLinks.map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 rounded-lg p-3 transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-md ${
                      isActive
                        ? "scale-[1.02] bg-gradient-to-r from-[#AD343E] to-[#8B2832] text-white shadow-lg"
                        : "text-muted-foreground hover:bg-gray-100 hover:text-[#AD343E] dark:hover:bg-gray-800"
                    } `}
                  >
                    <span
                      className={`transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`}
                    >
                      {link.icon}
                    </span>
                    <span className="font-medium">{link.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className="mt-auto p-4">
            <div className="mb-4 border-t pt-4">
              <p className="font-semibold">{accountInfo.username}</p>
              <p className="text-xs text-muted-foreground">{accountInfo.email}</p>
            </div>
            <Button size="sm" className="w-full" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Đăng xuất
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-screen flex-col overflow-y-auto">
        <main className="flex flex-1 flex-col gap-4 bg-muted/50 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
