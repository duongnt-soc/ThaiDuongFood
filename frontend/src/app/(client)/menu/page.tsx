"use client"

import { useState, useEffect, Suspense, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { Playfair_Display } from "next/font/google"

import { Button } from "@/components/ui/button"
import { getCategories } from "@/api/categories"
import { getProducts } from "@/api/products"
import { Product, Category } from "@/types/api"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatCurrencyVND } from "@/lib/utils"

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
})

const MenuPageContent = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [products, setProducts] = useState<Product[]>([])

  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)

  const [sortOrder, setSortOrder] = useState("default")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const searchQuery = searchParams.get("search") || ""
  const pageQuery = parseInt(searchParams.get("page") || "1")

  const [categories, setCategories] = useState<Category[]>([])
  const categoryQuery = searchParams.get("category") || ""
  const useAISearch = searchParams.get("ai_search") === "true"

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        setProducts([])

        const [productsData, categoriesData] = await Promise.all([
          getProducts(pageQuery, 9, searchQuery, categoryQuery, useAISearch),
          getCategories(),
        ])

        setProducts(productsData.products)
        setTotalPages(productsData.totalPages)
        setCurrentPage(productsData.page)
        setCategories(categoriesData.categories)
      } catch (err: any) {
        console.error("Lỗi tải dữ liệu menu:", err)
        setError("Không thể tải danh sách món ăn. Vui lòng thử lại.")
        setProducts([])
        setTotalPages(1)
        setCurrentPage(1)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [pageQuery, searchQuery, categoryQuery, useAISearch])

  const handleCategoryChange = (slug: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (slug) {
      params.set("category", slug)
    } else {
      params.delete("category")
    }
    params.set("page", "1")
    router.push(`/menu?${params.toString()}`)
  }

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", newPage.toString())
    router.push(`/menu?${params.toString()}`)
  }

  const sortedProducts = useMemo(() => {
    const sortableProducts = [...products]

    if (sortOrder === "low-to-high") {
      sortableProducts.sort((a, b) => a.price - b.price)
    } else if (sortOrder === "high-to-low") {
      sortableProducts.sort((a, b) => b.price - a.price)
    }
    return sortableProducts
  }, [products, sortOrder])

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#AD343E]" />
      </div>
    )
  }

  if (error) {
    return <div className="py-24 text-center text-red-500">{error}</div>
  }

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <h1
          className={`${playfair.className} mb-4 text-center text-4xl font-semibold text-gray-800 md:text-6xl`}
        >
          {searchQuery ? `Results for "${searchQuery}"` : "Our Full Menu"}
        </h1>
        {/* Số lượng món ăn (đã sửa lỗi null) */}
        <p className="mb-12 text-center text-gray-600">
          Danh sách có {products?.length ?? 0} món ăn.
        </p>

        {/* Filter Section */}
        <div className="mb-8">
          <div className="mb-4 flex justify-center md:justify-end">
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Sắp xếp theo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Mặc định</SelectItem>
                <SelectItem value="low-to-high">Giá: Thấp đến Cao</SelectItem>
                <SelectItem value="high-to-low">Giá: Cao đến Thấp</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              variant={!categoryQuery ? "default" : "outline"}
              onClick={() => handleCategoryChange(null)}
              className={`${!categoryQuery ? "bg-[#AD343E] text-white hover:bg-[#932b34]" : ""} rounded-full`}
            >
              Tất cả
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={categoryQuery === cat.slug ? "default" : "outline"}
                onClick={() => handleCategoryChange(cat.slug)}
                className={`${categoryQuery === cat.slug ? "bg-[#AD343E] text-white hover:bg-[#932b34]" : ""} rounded-full`} // Thêm text-white
              >
                {cat.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Danh sách sản phẩm */}
        {sortedProducts && sortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {sortedProducts.map((product) => (
              <Link href={`/products/${product.slug}`} key={product.id} className="group block">
                <div className="flex h-full flex-col overflow-hidden rounded-lg border bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                  {" "}
                  {/* Thêm border và hiệu ứng */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    {" "}
                    {/* Thêm overflow-hidden */}
                    <Image
                      src={product.image || "/assets/logo.png"} // Thêm ảnh fallback
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" // Tối ưu ảnh
                      style={{ objectFit: "cover" }}
                      className="transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-grow flex-col p-6">
                    <h3
                      className={`${playfair.className} mb-2 text-2xl font-semibold text-gray-800 group-hover:text-[#AD343E]`} // Thêm group-hover
                    >
                      {product.name}
                    </h3>
                    <p className="mb-4 line-clamp-3 flex-grow text-sm text-gray-600">
                      {product.description || "Mô tả đang được cập nhật..."}
                    </p>{" "}
                    {/* Thêm line-clamp */}
                    <p className="mt-auto text-xl font-bold text-[#AD343E]">
                      {formatCurrencyVND(product.price)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          // Hiển thị khi không có sản phẩm
          <div className="py-16 text-center">
            <p className="text-xl text-gray-600">
              {searchQuery
                ? "Không tìm thấy món ăn phù hợp với tìm kiếm của bạn."
                : "Không có món ăn nào trong danh mục này."}
            </p>
          </div>
        )}

        {/* Phân trang: Chỉ hiển thị khi có nhiều hơn 1 trang */}
        {totalPages > 1 && (
          <div className="mt-16 flex items-center justify-center gap-4">
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              variant="outline"
              size="icon" // Làm nút nhỏ hơn
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Trang trước</span>
            </Button>
            <span className="text-sm font-semibold">
              {" "}
              {/* Chữ nhỏ hơn */}
              Trang {currentPage} / {totalPages}
            </span>
            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              variant="outline"
              size="icon" // Làm nút nhỏ hơn
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Trang sau</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

const MenuPage = () => (
  <Suspense
    fallback={
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#AD343E]" />
      </div>
    }
  >
    <MenuPageContent />
  </Suspense>
)

export default MenuPage
