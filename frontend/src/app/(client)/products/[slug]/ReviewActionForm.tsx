"use client"

import { useState, useEffect } from "react"
import { Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Review } from "@/types/api"
import { StarRating } from "@/components/StarRating"

interface ReviewActionFormProps {
  mode: 'edit' | 'reply'
  review: Review | null
  onSubmit: (data: { rating?: number; comment?: string; reply?: string }) => void
  onCancel: () => void
  isSubmitting: boolean
}

export const ReviewActionForm = ({ mode, review, onSubmit, onCancel, isSubmitting }: ReviewActionFormProps) => {
  const [rating, setRating] = useState(review?.rating || 0)
  const [comment, setComment] = useState(review?.comment || "")
  const [reply, setReply] = useState(review?.admin_reply || "")

  useEffect(() => {
    setRating(review?.rating || 0)
    setComment(review?.comment || "")
    setReply(review?.admin_reply || "")
  }, [review])

  if (!review) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === 'edit') {
      onSubmit({ rating, comment })
    } else {
      onSubmit({ reply })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-md border bg-gray-50 p-3">
        <p className="text-sm font-semibold">Original Review by {review.username}:</p>
        <StarRating rating={review.rating} size={14} className="my-1"/>
        <p className="text-sm italic text-gray-600">{review.comment}</p>
      </div>

      {mode === 'edit' && (
        <>
          <div className="flex items-center gap-2">
            <p>Your new rating:</p>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <button type="button" key={star} onClick={() => setRating(star)}>
                  <Star
                    className={`cursor-pointer transition-colors ${
                      rating >= star ? "text-yellow-400 fill-yellow-400" : "text-gray-300 hover:text-yellow-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Edit your comment..."
            required
          />
        </>
      )}

      {mode === 'reply' && (
        <Textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Write your reply..."
          required
        />
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </div>
    </form>
  )
}
