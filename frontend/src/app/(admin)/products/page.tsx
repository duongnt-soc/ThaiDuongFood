"use client"

import { useEffect, useState, useCallback, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import Image from "next/image"
import { Loader2, ChevronLeft, ChevronRight, PlusCircle, Trash2, SquarePen } from "lucide-react"

import { getProducts, createProduct, updateProduct, deleteProduct } from "@/api/products"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
import { Product } from "@/types/api"

import ProductForm, { ProductFormValues } from "./ProductForm"
import { formatCurrencyVND } from "../../../lib/utils"

const ProductsPageContent = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const pageQuery = parseInt(searchParams.get("page") || "1")

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await getProducts(pageQuery, 10)
      setProducts(data.products)
      setTotalPages(data.totalPages)
      setCurrentPage(data.page)
    } catch (error) {
      console.error(error)
      toast.error("Lỗi khi lấy danh sách sản phẩm.")
    } finally {
      setIsLoading(false)
    }
  }, [pageQuery])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      router.push(`/products?page=${newPage}`)
    }
  }

  const handleOpenModal = (product: Product | null) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedProduct(null)
  }

  const handleSaveProduct = async (data: ProductFormValues) => {
    setIsSaving(true)
    try {
      if (selectedProduct) {
        await updateProduct(selectedProduct.id, data)
        toast.success(`Món "${data.name}" đã được cập nhật!`)
      } else {
        await createProduct(data)
        toast.success(`Món "${data.name}" đã được thêm vào!`)
      }
      handleCloseModal()
      await fetchProducts()
    } catch (error) {
      console.error(error)
      toast.error("Lỗi khi cập nhật món ăn.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xoá món này?")) {
      try {
        await deleteProduct(id)
        toast.success("Xoá món ăn thành công!")
        if (products.length === 1 && currentPage > 1) {
          router.push(`/products?page=${currentPage - 1}`)
        } else {
          await fetchProducts()
        }
      } catch (error) {
        console.error(error)
        toast.error("Lỗi khi xoá món ăn.")
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
        <h1 className="text-3xl font-bold">Sản phẩm</h1>
        <Button onClick={() => handleOpenModal(null)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Thêm món ăn
        </Button>
      </div>
      <div className="mt-4 rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên món ăn</TableHead>
              <TableHead>Hình ảnh</TableHead>
              <TableHead className="hidden md:table-cell">Giá</TableHead>
              <TableHead className="hidden md:table-cell">Số lượng</TableHead>
              <TableHead>Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>
                  <Image
                    src={product.image || "/assets/placeholder.png"}
                    alt={product.name}
                    width={64}
                    height={64}
                    className="h-16 w-16 rounded object-cover"
                  />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {formatCurrencyVND(product.price)}
                </TableCell>
                <TableCell className="hidden md:table-cell">{product.quantity}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mr-2"
                    onClick={() => handleOpenModal(product)}
                  >
                    <SquarePen />
                    Cập nhật
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(product.id)}>
                    <Trash2 />
                    Xoá
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedProduct ? "Cập nhật món ăn" : "Thêm món ăn"}</DialogTitle>
          </DialogHeader>
          <ProductForm
            initialData={selectedProduct}
            onSave={handleSaveProduct}
            onCancel={handleCloseModal}
            isSaving={isSaving}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductsPageContent />
    </Suspense>
  )
}
