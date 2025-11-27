"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Minus, Plus, ShoppingCart, XCircle, Loader2, ArrowRight, Star } from "lucide-react"
import { Playfair_Display } from "next/font/google"
import { toast } from "sonner"

import { useBoundStore } from "@/zustand/total"
import { Button } from "@/components/ui/button"
import { getProductBySlug, getRelatedProducts } from "@/api/products"
import { Product, Review } from "@/types/api"
import { formatCurrencyVND } from "@/lib/utils"
// import SuggestedProducts from "@/components/SuggestedProducts"
import { getReviews, submitReview, updateReview, adminReplyToReview } from "@/api/reviews"
import { StarRating } from "@/components/StarRating"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import ReusableSlider, { SliderItem } from "@/components/ReusableSlider"
import ProductModal from "@/components/ProductModal"

import { ReviewActionForm } from "./ReviewActionForm"

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
})

const ReviewForm = ({
  productId,
  onReviewSubmit,
}: {
  productId: number
  onReviewSubmit: () => void
}) => {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      toast.error("Please select a rating.")
      return
    }
    setIsSubmitting(true)
    try {
      await submitReview(productId, { rating, comment })
      toast.success("Thank you for your review!")
      setRating(0)
      setComment("")
      onReviewSubmit()
    } catch (error) {
      console.error("Error submitting review:", error)
      toast.error("Failed to submit review. You may have already reviewed this product.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mt-8 rounded-lg border bg-gray-50 p-6">
      <h3 className="mb-4 text-xl font-semibold">Viết đánh giá của bạn:</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-2">
          <p>Rating:</p>
          {/* Star input */}
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                onClick={() => setRating(star)}
                className={`cursor-pointer ${rating >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
              />
            ))}
          </div>
        </div>
        <div>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Chia sẻ cảm nghĩ của bạn về món ăn này..."
          />
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
        </Button>
      </form>
    </div>
  )
}

const ReviewItem = ({ review, accountInfo, onEdit, onReply }: any) => (
  <div className="flex gap-4 border-b pb-6">
    <Avatar>
      <AvatarFallback>{review.username.charAt(0).toUpperCase()}</AvatarFallback>
    </Avatar>
    <div className="flex-grow">
      <div className="mb-1 flex items-center gap-4">
        <p className="font-semibold">{review.username}</p>
        <p className="text-xs text-gray-500">{new Date(review.created_at).toLocaleDateString()}</p>
      </div>
      <StarRating rating={review.rating} />
      <p className="mt-2 text-gray-700">{review.comment}</p>

      {accountInfo?.id === review.user_id.toString() && (
        <Button variant="link" size="sm" className="mr-3 h-auto p-0" onClick={() => onEdit(review)}>
          Chỉnh sửa
        </Button>
      )}

      {review.admin_reply && (
        <div className="ml-4 mt-4 border-l-2 pl-4">
          <p className="text-sm font-semibold">Thai Duong’s food phản hồi:</p>
          <p className="text-sm italic text-gray-600">{review.admin_reply}</p>
        </div>
      )}

      {accountInfo?.isAdmin && !review.admin_reply && (
        <Button
          variant="link"
          size="sm"
          className="h-auto p-0 text-[#AD343E]"
          onClick={() => onReply(review)}
        >
          Phản hồi
        </Button>
      )}
    </div>
  </div>
)

const ProductDetailPage = ({ params }: { params: { slug: string } }) => {
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const { addToCart } = useBoundStore()
  const [reviews, setReviews] = useState<Review[]>([])
  const [editingReview, setEditingReview] = useState<Review | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [replyingReview, setReplyingReview] = useState<Review | null>(null)
  const { accountInfo, openAuthModal } = useBoundStore()

  const [relatedProducts, setRelatedProducts] = useState<SliderItem[]>([])
  const [isLoadingRelated, setIsLoadingRelated] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedRelatedProduct, setSelectedRelatedProduct] = useState<SliderItem | null>(null)

  const handleRelatedProductClick = (item: SliderItem) => {
    setSelectedRelatedProduct(item)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setTimeout(() => setSelectedRelatedProduct(null), 300)
  }

  const fetchReviews = async (productId: number) => {
    try {
      const reviewsData = await getReviews(productId)
      setReviews(reviewsData)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    const fetchProductAndRelated = async () => {
      setIsLoading(true)
      setIsLoadingRelated(true)
      setProduct(null)
      setRelatedProducts([])
      setError(null)

      try {
        const data = await getProductBySlug(params.slug)
        setProduct(data)
        fetchReviews(data.id)

        try {
          const relatedData = await getRelatedProducts(data.id, 8)
          const relatedSliderItems = relatedData.map((p) => ({
            id: p.id,
            slug: p.slug,
            name: p.name,
            price: p.price,
            image: p.image || "/assets/placeholder.png",
          }))
          setRelatedProducts(relatedSliderItems)
        } catch (relatedError) {
          console.error("Lỗi tải sản phẩm liên quan:", relatedError)
        } finally {
          setIsLoadingRelated(false)
        }
      } catch (err: any) {
        if (err.response?.status === 404) {
          setError("Sản phẩm không tồn tại!")
        } else {
          setError("Đã có lỗi xảy ra khi tải sản phẩm.")
        }
        console.error(err)
        setIsLoadingRelated(false)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProductAndRelated()
  }, [params.slug])

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#AD343E]" />
      </div>
    )
  }

  if (error || !product) {
    return <div className="py-24 text-center text-red-500">{error}</div>
  }

  if (!product) {
    return <div className="py-24 text-center">Sản phẩm không tồn tại!</div>
  }

  const isOutOfStock = product.quantity === 0

  const handleQuantityChange = (amount: number) => {
    setQuantity((prev) => Math.max(1, prev + amount))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const num = parseInt(value, 10)
    if (!isNaN(num) && num > 0) {
      setQuantity(num)
    } else if (value === "") {
      setQuantity(1)
    }
  }

  const handleBuyNow = async () => {
    if (!product) return
    setIsRedirecting(true)
    try {
      await addToCart(product, quantity)
      router.push("/checkout")
    } catch (error) {
      console.error("Buy Now failed:", error)
      setIsRedirecting(false)
    }
  }

  const handleAddToCart = () => {
    if (!product) return

    addToCart(product, quantity)
  }

  const handleActionSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      if (editingReview) {
        await updateReview(editingReview.id, { rating: data.rating, comment: data.comment })
        toast.success("Your review has been updated.")
      } else if (replyingReview) {
        await adminReplyToReview(replyingReview.id, data.reply)
        toast.success("Your reply has been posted.")
      }
      setEditingReview(null)
      setReplyingReview(null)
      if (product) fetchReviews(product.id)
    } catch (error) {
      toast.error("An error occurred.")
      console.error("Error in review action:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  //   const handleReviewSubmitted = () => {
  //     setEditingReview(null)
  //     setReplyingReview(null)
  //     if (product) fetchReviews(product.id)
  //   }

  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <div className="grid items-start gap-8 md:grid-cols-2 md:gap-16">
        <div className="relative aspect-square w-full overflow-hidden rounded-lg shadow-lg">
          <Image src={product.image} alt={product.name} fill style={{ objectFit: "cover" }} />
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <span className="rounded-full bg-red-600 px-4 py-2 text-lg font-bold text-white">
                Đã hết hàng
              </span>
            </div>
          )}
        </div>
        <div className="flex h-full flex-col">
          <h1 className={`${playfair.className} mb-4 text-4xl font-bold text-gray-800 lg:text-5xl`}>
            {product.name}
          </h1>
          <p className="mb-6 text-3xl font-bold text-[#AD343E]">
            {formatCurrencyVND(product.price)}
          </p>
          <p className="mb-8 text-lg text-gray-600">{product.details}</p>

          <div className="mt-auto">
            <div className={`mb-6 flex items-center gap-4 ${isOutOfStock ? "invisible" : ""}`}>
              <p className="font-semibold">Số lượng:</p>
              <div className="flex items-center rounded-full border">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() => handleQuantityChange(-1)}
                >
                  <Minus size={16} />
                </Button>
                {/* <span className="w-10 text-center font-semibold">{quantity}</span> */}
                <input
                  className="w-10 bg-transparent text-center font-semibold outline-none"
                  value={quantity}
                  onChange={handleInputChange}
                  min="1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() => handleQuantityChange(1)}
                >
                  <Plus size={16} />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Button
                onClick={handleAddToCart}
                size="lg"
                className="w-full rounded-full border border-[#AD343E] bg-[#AD343E] py-5 text-lg transition duration-300 ease-in-out hover:scale-105 hover:bg-transparent hover:text-[#AD343E] active:scale-95"
                disabled={isOutOfStock}
              >
                {isOutOfStock ? (
                  <>
                    <XCircle size={20} className="mr-2" />
                    Đã hết hàng
                  </>
                ) : (
                  <>
                    <ShoppingCart size={20} className="mr-2" />
                    Thêm vào giỏ
                  </>
                )}
              </Button>

              <Button
                onClick={handleBuyNow}
                size="lg"
                className="w-full rounded-full border border-black bg-black py-5 text-lg text-white transition duration-300 ease-in-out hover:scale-105 hover:bg-transparent hover:text-black active:scale-95"
                disabled={isOutOfStock || isRedirecting}
              >
                {isRedirecting ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Mua ngay <ArrowRight size={20} className="ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t pt-4 md:mt-24">
        {" "}
        {/* Thêm border và padding top */}
        {isLoadingRelated ? (
          <div className="text-center">
            {" "}
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-400" />{" "}
          </div>
        ) : relatedProducts.length > 0 ? (
          <ReusableSlider
            subtitle="Gợi ý món ăn"
            title="You may also like"
            items={relatedProducts}
            onItemClick={handleRelatedProductClick}
          />
        ) : (
          <p className="text-center text-gray-500">Không tìm thấy sản phẩm tương tự.</p>
        )}
      </div>

      <div className="container mx-auto px-4 pb-24">
        <h2 className={`mb-8 border-b pb-4 text-3xl font-bold ${playfair.className}`}>Reviews</h2>
        {accountInfo.id ? (
          <ReviewForm productId={product!.id} onReviewSubmit={() => fetchReviews(product!.id)} />
        ) : (
          <div className="rounded-lg border bg-gray-50 p-8 text-center">
            <p className="mb-4">Bạn phải đăng nhập để đánh giá món ăn.</p>
            <Button onClick={openAuthModal}>Đăng nhập ngay!</Button>
          </div>
        )}
        <div className="mt-8 space-y-6">
          {reviews && reviews.length > 0 ? (
            reviews.map((review) => (
              <ReviewItem
                key={review.id}
                review={review}
                accountInfo={accountInfo}
                onEdit={setEditingReview}
                onReply={setReplyingReview}
              />
            ))
          ) : (
            <p className="pt-8 text-center text-gray-500">
              Chưa có đánh giá. Hãy viết cảm nhận của bạn nào!
            </p>
          )}
        </div>
      </div>

      <Dialog
        open={!!editingReview || !!replyingReview}
        onOpenChange={() => {
          setEditingReview(null)
          setReplyingReview(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingReview ? "Chỉnh sửa Đánh giá" : "Phản hồi Đánh giá"}</DialogTitle>
          </DialogHeader>
          <ReviewActionForm
            mode={editingReview ? "edit" : "reply"}
            review={(editingReview || replyingReview)!}
            onSubmit={handleActionSubmit}
            onCancel={() => {
              setEditingReview(null)
              setReplyingReview(null)
            }}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      <ProductModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        product={selectedRelatedProduct}
      />
    </div>
  )
}

export default ProductDetailPage
