"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Playfair_Display } from "next/font/google"
import { UtensilsCrossed, ChefHat, GlassWater, CakeSlice } from "lucide-react"

import { Button } from "@/components/ui/button"
import { TestimonialsSection } from "@/components/TestimonialsSection"
import ProductModal from "@/components/ProductModal"
import ReusableSlider, { SliderItem } from "@/components/ReusableSlider"
import { Section, SectionTitle } from "@/components/shared/Section"
import { getProducts } from "@/api/products"
import { ScrollAnimate } from "@/components/shared/ScrollAnimate"

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
})

const HeroSection = () => (
  <div className="relative flex h-[60vh] w-full items-center justify-center text-center text-white md:h-[80vh]">
    <Image
      src="/food/banner.webp"
      fill
      alt="A cozy restaurant interior"
      className="object-cover brightness-50"
      priority
    />
    <ScrollAnimate>
      <div className="relative z-10 p-4">
        <h1
          className={`${playfair.className} mx-auto mb-4 text-4xl font-medium md:text-6xl lg:max-w-xl lg:text-8xl`}
        >
          Best food for your taste
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-base md:text-lg">
          Khám phá những món ăn và đồ uống ngon nhất trong thị trấn, được chế biến bằng đam mê và
          phục vụ bằng tình yêu.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="#reusable-slider">
            <Button
              size="lg"
              className="rounded-full bg-[#AD343E] px-6 py-6 hover:bg-[#932b34] lg:px-10 lg:py-8 xl:text-lg"
            >
              Yêu thích
            </Button>
          </Link>
          <Link href="/menu">
            <Button
              size="lg"
              variant="outline"
              className="rounded-full border-white bg-transparent px-6 py-6 text-white hover:bg-white hover:text-black lg:px-10 lg:py-8 xl:text-lg"
            >
              Thực đơn
            </Button>
          </Link>
        </div>
      </div>
    </ScrollAnimate>
  </div>
)

const BrowseMenuSection = () => {
  const menuItems = [
    {
      icon: <UtensilsCrossed size={40} className="text-[#AD343E]" />,
      title: "Breakfast",
      description:
        "Bắt đầu ngày mới với các lựa chọn bữa sáng ngon miệng và thịnh soạn của chúng tôi.",
      href: "menu?category=breakfast&page=1",
    },
    {
      icon: <ChefHat size={40} className="text-[#AD343E]" />,
      title: "Main dishes",
      description: "Khám phá nhiều món chính đậm đà hương vị, từ cổ điển đến hiện đại.",
      href: "menu?category=main-dishes&page=1",
    },
    {
      icon: <GlassWater size={40} className="text-[#AD343E]" />,
      title: "Drinks",
      description:
        "Giải tỏa cơn khát với tuyển chọn đồ uống giải khát và rượu vang hảo hạng của chúng tôi.",
      href: "menu?category=drinks&page=1",
    },
    {
      icon: <CakeSlice size={40} className="text-[#AD343E]" />,
      title: "Desserts",
      description:
        "Thưởng thức các món ngọt và tráng miệng thơm ngon để hoàn thiện bữa ăn của bạn.",
      href: "menu?category=desserts&page=1",
    },
  ]

  return (
    <Section className="">
      <SectionTitle subtitle="Thực đơn của chúng tôi" title="Browse Our Menu" />
      <ScrollAnimate>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {menuItems.map((item, index) => (
            <div
              key={index}
              className="flex transform flex-col items-center rounded-lg bg-white p-8 text-center shadow-md transition-transform hover:scale-105"
            >
              <div className="mb-8 rounded-full bg-gray-100 p-5">{item.icon}</div>
              <h3 className={`${playfair.className} mb-4 text-xl font-semibold text-gray-800`}>
                {item.title}
              </h3>
              <p className="mb-4 text-gray-600">{item.description}</p>
              <a href={`${item.href}`} className="font-semibold text-[#AD343E]">
                Khám phá
              </a>
            </div>
          ))}
        </div>
      </ScrollAnimate>
    </Section>
  )
}

const HealthyFoodSection = () => (
  <Section>
    <ScrollAnimate>
      <div className="grid items-center gap-12 md:grid-cols-2 lg:gap-24">
        <div className="relative h-96">
          <Image
            src="/food/f1.webp"
            alt="A healthy meal with fresh ingredients"
            fill
            className="rounded-lg object-cover shadow-lg"
          />
        </div>
        <div className="text-center md:text-left">
          <SectionTitle
            title="We provide healthy food for your family."
            className="mb-6 text-center md:text-left"
          />
          <p className="mb-6 text-gray-600">
            Câu chuyện của chúng tôi bắt đầu từ một ý tưởng đơn giản: tạo ra một nơi mọi người có
            thể thưởng thức những món ăn ngon, bổ dưỡng được làm từ những nguyên liệu tươi ngon
            nhất. Chúng tôi tin vào sức mạnh của món ăn ngon để gắn kết mọi người.
          </p>
          <Link href="/about">
            <Button
              size="lg"
              className="rounded-full bg-[#AD343E] px-6 py-6 hover:bg-[#932b34] lg:px-10 lg:py-8 xl:text-lg"
            >
              Câu chuyện ẩm thực
            </Button>
          </Link>
        </div>
      </div>
    </ScrollAnimate>
  </Section>
)

const BlogSection = () => {
  const blogPosts = [
    {
      image: "/food/f2.webp",
      date: "January 3, 2025",
      title: "The secret tips & tricks to prepare a perfect burger & pizza for our customers",
      excerpt:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime mollitia, molestiae quas vel sint commodi repudiandae consequuntur voluptatum laborum numquam blanditiis harum quisquam eius sed odit.",
      href: "#",
    },
    {
      image: "/food/f3.webp",
      date: "January 3, 2025",
      title: "How to prepare the perfect french fries in an air fryer",
      href: "#",
    },
    {
      image: "/food/f4.webp",
      date: "January 3, 2025",
      title: "How to prepare delicious chicken tenders",
      href: "#",
    },
    {
      image: "/food/f5.webp",
      date: "January 3, 2025",
      title: "7 delicious cheesecake recipes you can prepare",
      href: "#",
    },
    {
      image: "/food/f6.webp",
      date: "January 3, 2025",
      title: "5 great pizza restaurants you should visit this city",
      href: "#",
    },
  ]

  return (
    <Section>
      <div className="mb-12 flex items-center justify-between">
        <h2
          className={`${playfair.className} text-3xl font-semibold text-gray-800 md:text-4xl lg:text-5xl`}
        >
          Our Blog & Articles
        </h2>
        <Button className="hidden rounded-full bg-[#AD343E] px-6 py-3 hover:bg-[#932b34] md:block">
          Read All Articles
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {blogPosts.map((post, index) => {
          if (index === 0) {
            return (
              <div
                key={post.title}
                className="group flex flex-col overflow-hidden rounded-lg bg-white shadow-lg sm:col-span-2 lg:col-span-2 lg:row-span-2"
              >
                <a href={post.href} className="flex flex-grow flex-col">
                  <div className="relative aspect-video h-full w-full">
                    <Image
                      src={post.image}
                      fill
                      alt={post.title}
                      className="transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-grow flex-col p-6">
                    <p className="mb-2 text-sm text-gray-500">{post.date}</p>
                    <h3
                      className={`${playfair.className} mb-4 text-2xl font-semibold text-gray-800 group-hover:text-[#AD343E]`}
                    >
                      {post.title}
                    </h3>
                    <p className="flex-grow text-gray-600">{post.excerpt}</p>
                  </div>
                </a>
              </div>
            )
          }
          return (
            <div key={post.title} className="group overflow-hidden rounded-lg bg-white shadow-lg">
              <a href={post.href}>
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src={post.image}
                    fill
                    style={{ objectFit: "cover" }}
                    alt={post.title}
                    className="transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <p className="mb-2 text-sm text-gray-500">{post.date}</p>
                  <h3
                    className={`${playfair.className} text-xl font-semibold text-gray-800 group-hover:text-[#AD343E]`}
                  >
                    {post.title}
                  </h3>
                </div>
              </a>
            </div>
          )
        })}
      </div>

      <div className="mt-10 text-center md:hidden">
        <Button className="rounded-full bg-[#AD343E] px-6 py-3 hover:bg-[#932b34]">
          Read All Articles
        </Button>
      </div>
    </Section>
  )
}

export default function Home() {
  const [bestSellers, setBestSellers] = useState<SliderItem[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<SliderItem | null>(null)

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const data = await getProducts(1, 8)
        const sliderItems = data.products.map((p) => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          price: p.price,
          image: p.image,
        }))
        setBestSellers(sliderItems)
      } catch (error) {
        console.error("Failed to fetch best sellers:", error)
      }
    }
    fetchBestSellers()
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
      <main>
        <HeroSection />
        <BrowseMenuSection />
        <div className="bg-gray-50">
          <ReusableSlider
            subtitle="Món ăn bán chạy nhất"
            title="Our Best Sellers"
            items={bestSellers}
            onItemClick={handleProductClick}
          />
        </div>
        <HealthyFoodSection />
        <TestimonialsSection />
        <BlogSection />
      </main>
      <ProductModal isOpen={isModalOpen} onClose={handleCloseModal} product={selectedProduct} />
    </>
  )
}
