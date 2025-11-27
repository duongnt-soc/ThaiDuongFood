import { Playfair_Display } from "next/font/google"

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
})

export const Section = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => <section className={`container mx-auto px-4 py-16 md:py-24 ${className}`}>{children}</section>

export const SectionTitle = ({
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
