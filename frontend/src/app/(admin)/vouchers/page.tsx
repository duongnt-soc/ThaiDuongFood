"use client"
import { useEffect, useState, useCallback, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, PlusCircle, Trash2, SquarePen, ChevronLeft, ChevronRight } from "lucide-react"

import {
  adminGetAllVouchers,
  adminCreateVoucher,
  adminUpdateVoucher,
  adminDeleteVoucher,
} from "@/api/vouchers"
import { Voucher } from "@/types/api"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table"
import { formatCurrencyVND } from "@/lib/utils"

import VoucherForm, { VoucherFormValues } from "./VoucherForm"

const VouchersPageContent = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const pageQuery = parseInt(searchParams.get("page") || "1")

  const fetchVouchers = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await adminGetAllVouchers(pageQuery, 10)
      setVouchers(data.vouchers)
      setTotalPages(data.totalPages)
      setCurrentPage(data.page)
    } catch (error) {
      console.error(error)
      toast.error("Lỗi khi tải danh sách mã giảm giá.")
    } finally {
      setIsLoading(false)
    }
  }, [pageQuery])

  useEffect(() => {
    fetchVouchers()
  }, [fetchVouchers])

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      router.push(`/vouchers?page=${newPage}`)
    }
  }

  const handleOpenModal = (voucher: Voucher | null) => {
    setSelectedVoucher(voucher)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedVoucher(null)
  }

  const handleSave = async (data: VoucherFormValues) => {
    setIsSaving(true)
    const productIds = data.applicable_product_ids
      ? data.applicable_product_ids
          .split(",")
          .map((id) => parseInt(id.trim(), 10))
          .filter((id) => !isNaN(id))
      : []

    const payload = {
      ...data,
      hunt_start_time: data.hunt_start_time.toISOString(),
      hunt_end_time: data.hunt_end_time.toISOString(),
      applicable_product_ids: productIds,
    }

    try {
      if (selectedVoucher) {
        await adminUpdateVoucher(selectedVoucher.id, payload)
        toast.success("Cập nhật voucher thành công!")
        handleCloseModal()
      } else {
        await adminCreateVoucher(payload)
        toast.success("Tạo voucher mới thành công!")
        handleCloseModal()
        router.push("/vouchers?page=1")
      }
      await fetchVouchers()
    } catch (error) {
      toast.error("Đã có lỗi xảy ra khi lưu voucher.")
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (voucherId: number) => {
    if (
      confirm(
        "Bạn có chắc chắn muốn xóa mã giảm giá này? Tất cả các mã người dùng đã nhận cũng sẽ bị xóa."
      )
    ) {
      try {
        await adminDeleteVoucher(voucherId)
        toast.success("Đã xóa mã giảm giá thành công.")

        if (vouchers.length === 1 && currentPage > 1) {
          router.push(`/vouchers?page=${currentPage - 1}`)
        } else {
          await fetchVouchers()
        }
      } catch (error) {
        console.error(error)
        toast.error("Xóa thất bại. Vui lòng thử lại.")
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Mã giảm giá</h1>
        <Button onClick={() => handleOpenModal(null)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Tạo mã mới
        </Button>
      </div>
      <div className="mt-4 rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead>Giảm giá</TableHead>
              <TableHead>Thời gian săn</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vouchers &&
              vouchers.map((voucher) => (
                <TableRow key={voucher.id}>
                  <TableCell className="font-medium">{voucher.code}</TableCell>
                  <TableCell>{voucher.description}</TableCell>
                  <TableCell>
                    {voucher.discount_type === "percentage"
                      ? `${voucher.discount_value}%`
                      : formatCurrencyVND(voucher.discount_value)}
                  </TableCell>
                  <TableCell>
                    {new Date(voucher.hunt_start_time).toLocaleString()} <br />{" "}
                    {new Date(voucher.hunt_end_time).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="mr-2"
                      onClick={() => handleOpenModal(voucher)}
                    >
                      <SquarePen className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(voucher.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
          <TableFooter>
            <TableCell colSpan={5}>
              <div className="flex items-center justify-end gap-4">
                <span className="text-sm text-muted-foreground">
                  Trang {currentPage} trong tổng {totalPages}
                </span>
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableFooter>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedVoucher ? "Chỉnh sửa mã giảm giá" : "Tạo mã giảm giá mới"}
            </DialogTitle>
          </DialogHeader>
          <VoucherForm
            initialData={selectedVoucher}
            onSave={handleSave}
            onCancel={handleCloseModal}
            isSaving={isSaving}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function VouchersPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VouchersPageContent />
    </Suspense>
  )
}
