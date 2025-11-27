"use client"

import Image from "next/image"
import { Quote } from "lucide-react"
import { Playfair_Display } from "next/font/google"

import { ScrollAnimate } from "./shared/ScrollAnimate"

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
})

const Section = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <section className={`px-4 py-16 md:px-[150px] md:py-24 ${className}`}>{children}</section>
)

const SectionTitle = ({
  subtitle,
  title,
  className = "",
}: {
  subtitle?: string
  title: string
  className?: string
}) => (
  <div className={`mb-12 text-center ${className}`}>
    {subtitle && (
      <p className="mb-2 text-sm font-medium uppercase tracking-widest text-gray-500">{subtitle}</p>
    )}
    <h2
      className={`${playfair.className} text-3xl font-semibold text-gray-800 md:text-4xl lg:text-5xl`}
    >
      {title}
    </h2>
  </div>
)

export const TestimonialsSection = () => {
  const testimonials = [
    {
      quote:
        "The food was absolutely wonderful, from preparation to presentation, very pleasing. We especially enjoyed the special bar drinks.",
      name: "Sophie Lauren",
      avatar: "/assets/u1.webp",
    },
    {
      quote:
        "It’s a great experience. The ambiance is very welcoming and charming. Amazing food, service, and atmosphere. Staff are extremely knowledgeable.",
      name: "Mark Johnson",
      avatar: "/assets/u2.webp",
    },
    {
      quote:
        "This is my absolute favorite restaurant. The food is always fantastic and no matter what I order I am always delighted with my meal!",
      name: "Julia Roberts",
      avatar: "/assets/u3.webp",
    },
  ]

  return (
    <Section className="bg-gray-50">
      <SectionTitle subtitle="Testimonials" title="What Our Customers Say" />
      <ScrollAnimate>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="flex flex-col items-center rounded-lg bg-white p-8 text-center shadow-lg"
            >
              <Quote className="mb-4 text-[#AD343E]" size={32} />
              <p className="mb-6 italic text-gray-600">{testimonial.quote}</p>
              <Image
                src={testimonial.avatar}
                width={60}
                height={60}
                alt={testimonial.name}
                className="mb-2 rounded-full"
              />
              <p className="font-semibold text-gray-800">{testimonial.name}</p>
            </div>
          ))}
        </div>
      </ScrollAnimate>
      <div className="mt-12 w-full text-center">
        <a href="#" className="text-[#AD343E] underline hover:text-[#932b34]">
          All of rates
        </a>
      </div>
    </Section>
  )
}
