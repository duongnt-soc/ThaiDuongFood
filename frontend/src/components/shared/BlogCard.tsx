import Image from "next/image"
import Link from "next/link"
import { Playfair_Display } from "next/font/google"

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
})

interface BlogCardProps {
  image: string
  date: string
  title: string
  slug: string
}

export const BlogCard = ({ image, date, title, slug }: BlogCardProps) => {
  return (
    <div className="group overflow-hidden rounded-lg bg-white shadow-lg transition-shadow duration-300 hover:shadow-2xl">
      <Link href={`/blog/${slug}`}>
        <div className="relative aspect-[4/3] w-full">
          <Image
            src={image}
            fill
            alt={title}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div className="p-6">
          <p className="mb-2 text-sm text-gray-500">{date}</p>
          <h3
            className={`${playfair.className} text-xl font-semibold text-gray-800 transition-colors group-hover:text-[#AD343E]`}
          >
            {title}
          </h3>
        </div>
      </Link>
    </div>
  )
}
