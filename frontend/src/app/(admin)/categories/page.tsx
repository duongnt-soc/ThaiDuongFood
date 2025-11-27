"use client"
import { useEffect, useState, useCallback } from "react"
import { toast } from "sonner"
import { useSearchParams, useRouter } from "next/navigation"
import { Loader2, PlusCircle, ChevronLeft, ChevronRight, Trash2, SquarePen } from "lucide-react"

import { getCategories, createCategory, updateCategory, deleteCategory } from "@/api/categories"
import { Category, CategoryPayload } from "@/types/api"
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const CategoryForm = ({
  initialData,
  onSave,
  onCancel,
}: {
  initialData: Category | null
  onSave: (data: CategoryPayload) => void
  onCancel: () => void
}) => {
  const [name, setName] = useState(initialData?.name || "")
  const [slug, setSlug] = useState(initialData?.slug || "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ name, slug })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Tên danh mục</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="slug">Mô tả</Label>
        <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Thoát
        </Button>
        <Button type="submit">Lưu</Button>
      </div>
    </form>
  )
}

export default function CategoriesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [categories, setCategories] = useState<Category[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)

  const pageQuery = parseInt(searchParams.get("page") || "1")

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await getCategories(pageQuery)
      setCategories(data.categories)
      setTotalPages(data.totalPages)
      setCurrentPage(data.page)
    } catch (error) {
      console.error(error)
      toast.error("Lỗi khi lấy dữ liệu danh mục.")
    } finally {
      setIsLoading(false)
    }
  }, [pageQuery])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      router.push(`/categories?page=${newPage}`)
    }
  }

  const handleSave = async (data: CategoryPayload) => {
    try {
      if (selectedCategory) {
        await updateCategory(selectedCategory.id, data)
        toast.success("Danh mục đã cập nhật.")
      } else {
        await createCategory(data)
        toast.success("Danh mục đã được tạo.")
      }
      setIsModalOpen(false)
      fetchCategories()
    } catch (error) {
      console.error(error)
      toast.error("Lỗi khi lưu danh mục.")
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm("Bạn thực sự muốn xoá danh mục này?")) {
      try {
        await deleteCategory(id)
        toast.success("Danh mục đã được xoá.")
        if (categories.length === 1 && currentPage > 1) {
          router.push(`/categories?page=${currentPage - 1}`)
        } else {
          await fetchCategories()
        }
      } catch (error) {
        console.error(error)
        toast.error("Lỗi khi xoá danh mục.")
      }
    }
  }

  if (isLoading) {
    return (
      <div className="p-10 text-center">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  return (
    <div className="pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Danh mục</h1>
        <Button
          onClick={() => {
            setSelectedCategory(null)
            setIsModalOpen(true)
          }}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Thêm danh mục
        </Button>
      </div>
      <div className="mt-4 rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên danh mục</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead>Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell className="font-medium">{cat.name}</TableCell>
                <TableCell>{cat.slug}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mr-2"
                    onClick={() => {
                      setSelectedCategory(cat)
                      setIsModalOpen(true)
                    }}
                  >
                    <SquarePen />
                    Cập nhật
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(cat.id)}>
                    <Trash2 />
                    Xoá
                  </Button>
                </TableCell>
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
            <DialogTitle>{selectedCategory ? "Cập nhật danh mục" : "Thêm danh mục"}</DialogTitle>
          </DialogHeader>
          <CategoryForm
            initialData={selectedCategory}
            onSave={handleSave}
            onCancel={() => setIsModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
