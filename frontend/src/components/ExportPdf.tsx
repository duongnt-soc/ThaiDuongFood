"use client"

import React, { useState } from "react"
import { Download, Loader2 } from "lucide-react"

import { exportOrderPDF, adminExportOrderPDF } from "@/api/orders"

interface ExportPdfProps {
  orderId: number
  isAdmin?: boolean
  variant?: "default" | "icon" | "text"
  className?: string
}

const ExportPdf: React.FC<ExportPdfProps> = ({
  orderId,
  isAdmin = false,
  variant = "default",
  className = "",
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExportPDF = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const blob = isAdmin ? await adminExportOrderPDF(orderId) : await exportOrderPDF(orderId)

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `order_${orderId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Error exporting PDF:", err)
      setError("Không thể xuất PDF. Vui lòng thử lại.")
    } finally {
      setIsLoading(false)
    }
  }

  // Variant: Icon only
  if (variant === "icon") {
    return (
      <button
        onClick={handleExportPDF}
        disabled={isLoading}
        className={`rounded-lg p-2 transition-colors ${
          isLoading ? "cursor-not-allowed bg-gray-100" : "hover:bg-gray-100 active:bg-gray-200"
        } ${className}`}
        title="Xuất PDF"
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
        ) : (
          <Download className="h-5 w-5 text-gray-700" />
        )}
      </button>
    )
  }

  // Variant: Text only
  if (variant === "text") {
    return (
      <button
        onClick={handleExportPDF}
        disabled={isLoading}
        className={`text-blue-600 underline hover:text-blue-800 disabled:text-gray-400 disabled:no-underline ${className}`}
      >
        {isLoading ? "Đang xuất..." : "Xuất PDF"}
      </button>
    )
  }

  // Variant: Default button
  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleExportPDF}
        disabled={isLoading}
        className={`flex items-center gap-2 rounded-lg p-0 transition-colors disabled:cursor-not-allowed disabled:bg-gray-300 ${className}`}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Đang xuất...</span>
          </>
        ) : (
          <>
            <Download className="h-4 w-4" /> Xuất PDF
          </>
        )}
      </button>
    </div>
  )
}

export default ExportPdf
