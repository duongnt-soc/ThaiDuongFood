"use client"

import { ChevronLeft, ChevronRight, Eye, Loader2, MoreHorizontal } from "lucide-react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { getAllOrders, getOrderDetails, updateOrderStatus } from "@/api/orders"
import ExportPdf from "@/components/ExportPdf"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrencyVND } from "@/lib/utils"
import { Order } from "@/types/api"

const getStatusVariant = (status: string): string => {
  switch (status?.toLowerCase()) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "pending_payment":
      return "bg-orange-100 text-orange-800 border-orange-200"
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

const orderStatuses = [
  "pending",
  "pending_payment",
  "processing",
  "shipped",
  "completed",
  "cancelled",
]

export default function OrdersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [orders, setOrders] = useState<Order[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)

  const pageQuery = parseInt(searchParams.get("page") || "1")

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true)
        const data = await getAllOrders(pageQuery)
        setOrders(data.orders)
        setTotalPages(data.totalPages)
        setCurrentPage(data.page)
      } catch (err) {
        console.error(err)
        toast.error("Lỗi khi lấy danh sách đơn hàng.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageQuery])

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      router.push(`/orders?page=${newPage}`)
    }
  }

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus)
      toast.success(`Đơn hàng #${orderId} đã được cập nhật thành ${newStatus}.`)
      setOrders((prevOrders) =>
        prevOrders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order))
      )
    } catch (error) {
      console.error(error)
      toast.error("Lỗi khi cập nhật trạng thái đơn hàng.")
    }
  }

  const handleViewDetails = async (orderId: number) => {
    try {
      setIsLoadingDetails(true)
      const orderDetails = await getOrderDetails(orderId)
      setSelectedOrder(orderDetails)
      setIsModalOpen(true)
    } catch (error) {
      console.error(error)
      toast.error("Không thể tải chi tiết đơn hàng")
    } finally {
      setIsLoadingDetails(false)
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
        <h1 className="text-3xl font-bold">Đơn hàng</h1>
      </div>
      <div className="mt-4 rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Mã đơn</TableHead>
              <TableHead>Tên khách hàng</TableHead>
              <TableHead className="w-[150px]">Số điện thoại</TableHead>
              <TableHead>Địa chỉ</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead className="w-[150px]">Tổng tiền</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="w-[150px]">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="w-[120px] font-medium">#{order.id}</TableCell>
                <TableCell>
                  <div className="font-medium">{order.customer_name}</div>
                  <div className="text-sm text-muted-foreground">{order.username}</div>
                </TableCell>
                <TableCell className="w-[150px]">{order.customer_phone}</TableCell>
                <TableCell>{order.shipping_address}</TableCell>
                <TableCell>
                  {new Date(order.created_at).toLocaleString("vi-VN", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                  })}
                </TableCell>
                <TableCell className="w-[150px]">{formatCurrencyVND(order.total_amount)}</TableCell>
                <TableCell>
                  <Badge className={getStatusVariant(order.status)}>{order.status}</Badge>
                </TableCell>
                <TableCell className="w-[150px]">
                  <div className="flex items-center gap-1">
                    <ExportPdf orderId={order.id} variant="icon" isAdmin={true} />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {orderStatuses.map((status) => {
                          let isDisabled = false

                          if (order.status === status) {
                            isDisabled = true
                          }
                          if (order.status === "completed") {
                            isDisabled = true
                          }
                          if (order.status === "shipped" && status === "cancelled") {
                            isDisabled = true
                          }

                          return (
                            <DropdownMenuItem
                              key={status}
                              onClick={() => handleStatusChange(order.id, status)}
                              disabled={isDisabled}
                              className=""
                            >
                              Trạng thái {status}
                            </DropdownMenuItem>
                          )
                        })}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleViewDetails(order.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Xem chi tiết
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableCell colSpan={8}>
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
                  <span className="sr-only">Quay lại</span>
                </Button>
                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                >
                  <span className="sr-only">Trang tiếp</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableFooter>
        </Table>
      </div>

      {/* Modal chi tiết đơn hàng */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-h-[80vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết đơn hàng #{selectedOrder?.id}</DialogTitle>
          </DialogHeader>

          {isLoadingDetails ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : selectedOrder ? (
            <div className="space-y-4">
              {/* Thông tin khách hàng */}
              <div className="rounded-lg bg-gray-50 p-4">
                <h3 className="mb-2 font-semibold">Thông tin khách hàng</h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="font-medium">Tên:</span> {selectedOrder.customer_name}
                  </p>
                  <p>
                    <span className="font-medium">SĐT:</span> {selectedOrder.customer_phone}
                  </p>
                  <p>
                    <span className="font-medium">Địa chỉ:</span> {selectedOrder.shipping_address}
                  </p>
                  <p>
                    <span className="font-medium">Trạng thái:</span>{" "}
                    <Badge className={getStatusVariant(selectedOrder.status)}>
                      {selectedOrder.status}
                    </Badge>
                  </p>
                </div>
              </div>

              {/* Danh sách món ăn */}
              <div>
                <h3 className="mb-3 font-semibold">Món ăn</h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 rounded-lg border p-3">
                      <Image
                        src={item.product_image || "/assets/placeholder.png"}
                        alt={item.product_name}
                        width={80}
                        height={80}
                        className="rounded object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{item.product_name}</h4>
                        <p className="text-sm text-gray-600">
                          Số lượng: {item.quantity} x {formatCurrencyVND(item.price_at_purchase)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatCurrencyVND(item.price_at_purchase * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tổng tiền */}
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng cộng:</span>
                  <span>{formatCurrencyVND(selectedOrder.total_amount)}</span>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
