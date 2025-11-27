"use client"

import { useEffect, useState, Suspense, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, MessageSquare, Trash2, ChevronLeft, ChevronRight } from "lucide-react"

import { adminGetAllReviews, adminReplyToReview, adminDeleteReview } from "@/api/reviews"
import { Review } from "@/types/api"
import { Button } from "@/components/ui/button"
import { StarRating } from "@/components/StarRating"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

// Component Form Phản hồi
const ReplyForm = ({
  onSubmit,
  onCancel,
}: {
  onSubmit: (reply: string) => void
  onCancel: () => void
}) => {
  const [reply, setReply] = useState("")
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(reply)
      }}
      className="space-y-4"
    >
      <Textarea
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        placeholder="Viết phản hồi của bạn..."
        required
      />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit">Gửi phản hồi</Button>
      </div>
    </form>
  )
}

const ReviewsPageContent = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [reviews, setReviews] = useState<Review[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [replyingReview, setReplyingReview] = useState<Review | null>(null)

  const pageQuery = parseInt(searchParams.get("page") || "1")

  const fetchReviews = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await adminGetAllReviews(pageQuery)
      setReviews(data.reviews)
      setTotalPages(data.totalPages)
      setCurrentPage(data.page)
    } catch (error) {
      toast.error("Lỗi khi tải danh sách đánh giá.")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }, [pageQuery])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      router.push(`/reviews?page=${newPage}`)
    }
  }

  const handleReply = async (reply: string) => {
    if (!replyingReview) return
    try {
      await adminReplyToReview(replyingReview.id, reply)
      toast.success("Đã gửi phản hồi thành công.")
      setReplyingReview(null)
      fetchReviews() // Tải lại để cập nhật giao diện
    } catch (error) {
      toast.error("Gửi phản hồi thất bại.")
      console.error(error)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) {
      try {
        await adminDeleteReview(id)
        toast.success("Đã xóa đánh giá.")
        fetchReviews() // Tải lại để cập nhật giao diện
      } catch (error) {
        console.error(error)
        toast.error("Xóa đánh giá thất bại.")
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
    <div>
      <h1 className="text-2xl font-bold">Quản lý Đánh giá</h1>
      <div className="mt-4 rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sản phẩm</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Đánh giá</TableHead>
              <TableHead>Bình luận</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map((review) => (
              <TableRow key={review.id}>
                <TableCell className="font-medium">{review.product_name}</TableCell>
                <TableCell>{review.username}</TableCell>
                <TableCell>
                  <StarRating rating={review.rating} />
                </TableCell>
                <TableCell>
                  <p className="max-w-xs truncate">{review.comment}</p>
                  {review.admin_reply && (
                    <p className="mt-2 text-xs italic text-green-700">Đã phản hồi</p>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    className="mr-2"
                    onClick={() => setReplyingReview(review)}
                    disabled={!!review.admin_reply}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Phản hồi
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(review.id)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Xóa
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {/* Phân trang */}
      <div className="mt-6 flex items-center justify-end gap-4">
        <span className="text-sm text-muted-foreground">
          Trang {currentPage} của {totalPages}
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

      {/* Dialog để Phản hồi */}
      <Dialog open={!!replyingReview} onOpenChange={() => setReplyingReview(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Phản hồi đánh giá của {replyingReview?.username}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 border-t pt-4">
            <p className="font-semibold">Bình luận gốc:</p>
            <p className="italic text-gray-600">{replyingReview?.comment}</p>
          </div>
          <ReplyForm onSubmit={handleReply} onCancel={() => setReplyingReview(null)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function ReviewsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-10">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <ReviewsPageContent />
    </Suspense>
  )
}
