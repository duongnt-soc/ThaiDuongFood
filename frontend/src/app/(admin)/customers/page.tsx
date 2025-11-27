"use client"
import { useEffect, useState, useCallback, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react"

import { getUsers } from "@/api/user"
import { User } from "@/types/api"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table"

const CustomersPageContent = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [customers, setCustomers] = useState<User[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  const pageQuery = parseInt(searchParams.get("page") || "1")

  const fetchCustomers = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await getUsers(pageQuery, 10)
      setCustomers(data.users)
      setTotalPages(data.totalPages)
      setCurrentPage(data.page)
    } catch (error) {
      console.error(error)
      toast.error("Lỗi khi lấy danh sách khách hàng.")
    } finally {
      setIsLoading(false)
    }
  }, [pageQuery])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      router.push(`/customers?page=${newPage}`)
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
      <h1 className="text-3xl font-bold">Khách hàng</h1>
      <div className="mt-4 rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên đăng nhập</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Ngày tạo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="py-3 font-medium">{customer.username}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{new Date(customer.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableCell colSpan={3}>
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
    </div>
  )
}

export default function CustomersPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CustomersPageContent />
    </Suspense>
  )
}
