"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Loader2, Trash2 } from "lucide-react"
import { Playfair_Display } from "next/font/google"

import { getUserVouchers, deleteUserVoucher } from "@/api/vouchers"
import { UserVoucher } from "@/types/api"
import { cn, formatCurrencyVND } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
})

// Component VoucherCard được cập nhật để có prop onDelete
const VoucherCard = ({
  userVoucher,
  onDelete,
}: {
  userVoucher: UserVoucher
  onDelete: (id: number) => void
}) => {
  const isExpired = new Date(userVoucher.expires_at) < new Date()
  const isDisabled = userVoucher.is_used || isExpired

  return (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden rounded-lg border bg-white p-6 shadow-sm transition-all",
        isDisabled && "bg-gray-50 opacity-60"
      )}
    >
      <div className="flex items-start justify-between border-b-2 border-dashed pb-4">
        <div>
          <p className="text-xl font-bold text-green-600">{userVoucher.voucher_info.code}</p>
          <p className="text-sm text-gray-600">{userVoucher.voucher_info.description}</p>
        </div>
        <div className="flex-shrink-0 text-right">
          <p className="text-2xl font-bold text-[#AD343E]">
            {userVoucher.voucher_info.discount_type === "percentage"
              ? `${userVoucher.voucher_info.discount_value}%`
              : formatCurrencyVND(userVoucher.voucher_info.discount_value)}
          </p>
          <p className="text-xs">GIẢM</p>
        </div>
      </div>
      <div className="mt-auto flex items-center justify-between pt-4">
        <p className="text-xs text-gray-500">
          Hạn sử dụng: {new Date(userVoucher.expires_at).toLocaleDateString("vi-VN")}
        </p>
        {/* Nút xóa chỉ hiển thị khi voucher đã vô hiệu */}
        {isDisabled && (
          <Button
            variant="ghost"
            size="icon"
            className="relative z-20 h-8 w-8 hover:text-red-500"
            onClick={() => onDelete(userVoucher.id)}
          >
            <Trash2 size={16} />
            <span className="sr-only">Xóa voucher</span>
          </Button>
        )}
      </div>

      {isDisabled && !userVoucher.is_used && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/70">
          <span className="rotate-[-20deg] rounded border-2 border-gray-400 px-4 py-2 text-2xl font-bold text-gray-400">
            ĐÃ HẾT HẠN
          </span>
        </div>
      )}
      {userVoucher.is_used && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/70">
          <span className="rotate-[-20deg] rounded border-2 border-red-500 px-4 py-2 text-2xl font-bold text-red-500">
            ĐÃ SỬ DỤNG
          </span>
        </div>
      )}
    </div>
  )
}

export default function MyVouchersPage() {
  const [vouchers, setVouchers] = useState<UserVoucher[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchVouchers = async () => {
    try {
      const data = await getUserVouchers(true)
      data.sort(
        (a, b) =>
          (a.is_used || new Date(a.expires_at) < new Date() ? 1 : -1) -
            (b.is_used || new Date(b.expires_at) < new Date() ? 1 : -1) ||
          new Date(a.expires_at).getTime() - new Date(b.expires_at).getTime()
      )
      setVouchers(data)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchVouchers()
  }, [])

  // Hàm xử lý logic xóa
  const handleDelete = async (userVoucherId: number) => {
    if (confirm("Bạn có muốn xóa voucher này khỏi ví không?")) {
      try {
        await deleteUserVoucher(userVoucherId)
        toast.success("Đã xóa voucher.")
        setVouchers((currentVouchers) => currentVouchers.filter((v) => v.id !== userVoucherId))
      } catch (error) {
        console.error(error)
        toast.error("Xóa voucher thất bại. Vui lòng thử lại.")
      }
    }
  }

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
        Ví voucher của tôi
      </h1>

      {vouchers.length > 0 ? (
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
          {vouchers.map((uv) => (
            <VoucherCard key={uv.id} userVoucher={uv} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <p className="mb-4 text-xl text-gray-600">Bạn chưa có mã giảm giá nào.</p>
        </div>
      )}
    </div>
  )
}
