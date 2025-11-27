"use client"

import Image from "next/image"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay } from "swiper/modules"
import { Playfair_Display } from "next/font/google"

import "swiper/css"
import "swiper/css/autoplay"
import { formatCurrencyVND } from "@/lib/utils"

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
})

export interface SliderItem {
  id: number
  slug: string
  name: string
  price: number
  image: string
}

interface ReusableSliderProps {
  title: string
  subtitle: string
  items: SliderItem[]
  onItemClick: (item: SliderItem) => void
}

const ReusableSlider: React.FC<ReusableSliderProps> = ({ title, subtitle, items, onItemClick }) => {
  return (
    <div className="py-16 md:py-24" id="reusable-slider">
      <div className="container mx-auto px-4">
        {subtitle && (
          <p className="mb-2 text-center text-sm font-medium uppercase tracking-widest text-gray-500">
            {subtitle}
          </p>
        )}
        <h2
          className={`${playfair.className} mb-12 text-center text-3xl font-semibold text-gray-800 md:text-4xl`}
        >
          {title}
        </h2>
        <Swiper
          modules={[Autoplay]}
          loop={true}
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
          }}
          slidesPerView={1}
          spaceBetween={30}
          breakpoints={{
            640: {
              slidesPerView: 2,
            },
            768: {
              slidesPerView: 3,
            },
            1024: {
              slidesPerView: 4,
            },
          }}
          className="!pb-4"
        >
          {items.map((item, index) => (
            <SwiperSlide key={index} onClick={() => onItemClick(item)} className="cursor-pointer">
              <div className="group text-center">
                <div className="relative mb-4 overflow-hidden rounded-lg">
                  <Image
                    src={item.image}
                    width={300}
                    height={300}
                    alt={item.name}
                    className="h-64 w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">{item.name}</h3>
                <p className="text-lg font-bold text-[#AD343E]">{formatCurrencyVND(item.price)}</p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  )
}

export default ReusableSlider
