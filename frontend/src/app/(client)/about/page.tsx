"use client"

import { useState } from "react"
import Image from "next/image"
import { Playfair_Display } from "next/font/google"
import { Phone, MapPin, Utensils, Zap, Play, TruckElectric } from "lucide-react"

import { Button } from "@/components/ui/button"
import { TestimonialsSection } from "@/components/TestimonialsSection"
import { Dialog, DialogContent } from "@/components/ui/dialog"

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
})

const Section = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <section className={`container mx-auto px-4 py-16 md:py-24 ${className}`}>{children}</section>
)

const IntroSection = () => (
  <Section>
    <div className="grid items-center gap-8 md:grid-cols-2 md:gap-16">
      <div className="relative">
        <Image
          src="/food/f7.webp"
          width={450}
          height={150}
          quality={100}
          alt="Healthy food dish"
          className="h-96 w-full rounded-lg object-cover shadow-lg"
        />
        <div className="absolute -bottom-8 -left-8 rounded-lg bg-gray-800 bg-opacity-80 p-6 text-white shadow-xl backdrop-blur-sm">
          <h3 className={`${playfair.className} mb-4 text-2xl font-semibold`}>Đến với chúng tôi</h3>
          <div className="space-y-3">
            <p className="flex items-center gap-3">
              <Phone size={16} /> 0967083126
            </p>
            <p className="flex items-center gap-3">
              <MapPin size={16} /> Tram Troi, Hoai Duc, Ha Noi
            </p>
          </div>
        </div>
      </div>
      <div className="mt-16 text-center md:mt-0 md:text-left">
        <h1
          className={`${playfair.className} mb-6 text-4xl font-semibold text-gray-800 lg:text-6xl`}
        >
          We provide healthy food for your family.
        </h1>
        <p className="mb-4 text-gray-600">
          Câu chuyện của chúng tôi bắt đầu từ một ý tưởng đơn giản: tạo ra một nơi mọi người có thể thưởng thức những món ăn ngon,
          lành mạnh được làm từ những nguyên liệu tươi ngon nhất. Chúng tôi tin vào sức mạnh của ẩm thực
          có thể kết nối mọi người lại với nhau.
        </p>
        <p className="text-gray-600">
          Tất cả các đầu bếp, những người xây dựng tòa nhà đều rất tuyệt và họ rất tuyệt, nhưng chúng tôi không biết rằng họ tuyệt đến vậy, nhưng chúng tôi không biết rằng họ tuyệt đến vậy.
        </p>
      </div>
    </div>
  </Section>
)

const VideoSection = ({ onPlay }: { onPlay: () => void }) => (
  <div
    className="relative flex h-[500px] items-center justify-center bg-cover bg-fixed bg-center text-center text-white"
    style={{
      backgroundImage: "url('https://images.unsplash.com/photo-1554118811-1e0d58224f24')",
    }}
  >
    <div className="absolute inset-0 bg-black opacity-50"></div>
    <div className="relative z-10">
      <Button
        onClick={onPlay}
        variant="outline"
        className="mb-6 h-24 w-24 rounded-full border-white bg-transparent text-white hover:bg-white hover:text-black"
      >
        <Play size={40} className="fill-current" />
      </Button>
      <h2 className={`${playfair.className} text-4xl font-semibold lg:text-5xl`}>
        Feel the authentic & <br /> original taste from us
      </h2>
    </div>
  </div>
)

const FeaturesSection = () => {
  const features = [
    {
      icon: <Utensils size={32} />,
      title: "Multi Cuisine",
      description: "In the new era of technology we look in the future with certainty life.",
    },
    {
      icon: <Zap size={32} />,
      title: "Easy To Order",
      description: "In the new era of technology we look in the future with certainty life.",
    },
    {
      icon: <TruckElectric size={32} />,
      title: "Fast Delivery",
      description: "In the new era of technology we look in the future with certainty life.",
    },
  ]
  return (
    <Section className="">
      <div className="grid gap-8 text-center sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <div key={feature.title} className="p-6">
            <div className="mb-4 inline-block text-[#AD343E]">{feature.icon}</div>
            <h3 className={`${playfair.className} mb-2 text-2xl font-semibold`}>{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}

const StatsSection = () => {
  const stats = [
    { value: "3", label: "Locations" },
    { value: "1995", label: "Founded" },
    { value: "65+", label: "Staff Members" },
    { value: "100%", label: "Satisfied Customers" },
  ]

  return (
    <Section>
      <div className="grid items-center gap-12 md:grid-cols-2">
        <div>
          <h2
            className={`${playfair.className} mb-6 text-4xl font-semibold text-gray-800 lg:text-5xl`}
          >
            A little information for our valuable guest
          </h2>
          <p className="mb-8 text-gray-600">
            {
              "We believe in the power of good food to bring people together. That's why we've been serving our community since 1995, growing from a single location to three, all thanks to our dedicated staff and satisfied customers."
            }
          </p>
          <div className="grid grid-cols-2 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-lg bg-gray-50 p-6 text-center shadow-sm">
                <p className={`${playfair.className} text-4xl font-bold text-[#AD343E]`}>
                  {stat.value}
                </p>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <Image
            src="/food/f9.webp"
            width={450}
            height={300}
            quality={100}
            alt="Chef preparing food"
            className="rounded-lg object-cover shadow-lg"
          />
        </div>
      </div>
    </Section>
  )
}

export default function AboutPage() {
  const [isVideoOpen, setIsVideoOpen] = useState(false)

  return (
    <main>
      <IntroSection />
      <VideoSection onPlay={() => setIsVideoOpen(true)} />
      <FeaturesSection />
      <StatsSection />
      <TestimonialsSection />

      <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
        <DialogContent className="h-auto max-w-3xl border-0 p-0">
          <div className="aspect-video">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  )
}
