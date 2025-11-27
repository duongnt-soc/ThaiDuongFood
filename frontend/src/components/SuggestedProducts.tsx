"use client"

import { useState, useEffect } from "react"

import ReusableSlider, { SliderItem } from "@/components/ReusableSlider"
import ProductModal from "@/components/ProductModal"
import { getProducts } from "@/api/products"
import { Product } from "@/types/api"

const SuggestedProducts = () => {
  const [suggested, setSuggested] = useState<SliderItem[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<SliderItem | null>(null)
  //   const router = useRouter()

  useEffect(() => {
    const fetchSuggestedProducts = async () => {
      try {
        const data = await getProducts(1, 8)
        const sliderItems = data.products.map((p: Product) => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          price: p.price,
          image: p.image,
        }))
        setSuggested(sliderItems)
      } catch (error) {
        console.error("Failed to fetch suggested products:", error)
      }
    }
    fetchSuggestedProducts()
  }, [])

  const handleProductClick = (product: SliderItem) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setTimeout(() => setSelectedProduct(null), 300)
  }

  return (
    <>
      <ReusableSlider
        subtitle="Có thể bạn cũng thích"
        title="You Might Also Like"
        items={suggested}
        onItemClick={handleProductClick}
      />
      <ProductModal isOpen={isModalOpen} onClose={handleCloseModal} product={selectedProduct} />
    </>
  )
}

export default SuggestedProducts
