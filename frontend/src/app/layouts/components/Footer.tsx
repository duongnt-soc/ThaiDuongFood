import Image from "next/image"
import Link from "next/link"
import { Playfair_Display } from "next/font/google"
import { Twitter, Facebook, Instagram, Github } from "lucide-react"

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
})

const FooterLinkColumn = ({
  title,
  links,
}: {
  title: string
  links: { href: string; label: string }[]
}) => (
  <div>
    <h3 className="mb-6 text-xl font-semibold text-white">{title}</h3>
    <nav aria-label={title}>
      <ul className="space-y-4">
        {links.map((link) => (
          <li key={link.label}>
            <Link href={link.href} className="text-gray-300 transition-colors hover:text-white">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  </div>
)

export default function Footer() {
  const pagesLinks = [
    { href: "/", label: "Trang chủ" },
    { href: "/about", label: "Giới thiệu" },
    { href: "/menu", label: "Thực đơn" },
    { href: "/blog", label: "Bài viết" },
    { href: "/contact", label: "Liên hệ" },
  ]

  const utilityLinks = [
    { href: "#", label: "Start Here" },
    { href: "#", label: "Styleguide" },
    { href: "#", label: "Licenses" },
    { href: "#", label: "Changelog" },
  ]

  const socialLinks = [
    { href: "#", label: "Twitter", icon: <Twitter size={18} /> },
    { href: "#", label: "Facebook", icon: <Facebook size={18} /> },
    { href: "#", label: "Instagram", icon: <Instagram size={18} /> },
    { href: "#", label: "Github", icon: <Github size={18} /> },
  ]

  const instagramImages = ["/food/f10.webp", "/food/f11.webp", "/food/f12.webp", "/food/f13.webp"]

  return (
    <footer className="bg-[#474747] px-4 pb-8 pt-24 text-white">
      <div className="container mx-auto">
        <div className="mb-16 grid grid-cols-1 gap-12 text-center md:grid-cols-2 md:text-left lg:grid-cols-4">
          <div className="flex flex-col items-center md:items-start">
            <Link href="/" className="mb-4 flex items-center gap-2">
              <Image src="/assets/logo.png" width={40} height={40} alt="Bistro Bliss Logo" />
              <h1 className={`${playfair.className} text-3xl italic`}>Thai Duong</h1>
            </Link>
            <p className="mb-6 max-w-xs text-gray-400">
              Trong kỷ nguyên công nghệ mới, chúng tôi hướng tới tương lai với sự tự tin và tự hào về
              công ty của chúng tôi.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={`Follow us on ${social.label}`}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#AD343E] text-white transition-transform hover:scale-110"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <FooterLinkColumn title="Pages" links={pagesLinks} />
          <FooterLinkColumn title="Utility Pages" links={utilityLinks} />

          <div>
            <h3 className="mb-6 text-xl font-semibold text-white">Theo dõi chúng tôi tại Facebook!</h3>
            <div className="mx-auto grid w-fit grid-cols-2 gap-2 lg:mx-0">
              {instagramImages.map((src) => (
                <div key={src} className="">
                  <Image
                    src={src}
                    width={150}
                    height={150}
                    alt={`Instagram post`}
                    className="aspect-square rounded-lg object-cover transition-opacity hover:opacity-80"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8 text-center text-gray-500">
          <p>Copyright © {new Date().getFullYear()} Hashtag Developer. All Rights Reserved</p>
        </div>
      </div>
    </footer>
  )
}
