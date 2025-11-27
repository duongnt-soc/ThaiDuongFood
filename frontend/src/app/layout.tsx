import type { Metadata, Viewport } from "next"
import { Toaster } from "sonner"
import { Montserrat } from "next/font/google"
import "./globals.css"

import { Providers } from "./providers"

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700']
})

export const viewport: Viewport = {
  width: "device-width",
  height: "device-height",
  initialScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  metadataBase: new URL("https://graduation-project-seven-sepia.vercel.app"),
  title: "Thai Duong's food",
  description: "Tinh tế làm nên hương vị của món ăn!",
  keywords: ["Thai Duong's food", "đồ ăn nhanh", "ăn sáng", "ăn nhẹ", "ẩm thực"],
  icons: {
    icon: "/images/favicon.ico",
  },
  openGraph: {
    title: "Thai Duong's food",
    description: "Tinh tế làm nên hương vị của món ăn!",
    url: "https://graduation-project-seven-sepia.vercel.app",
    siteName: "Thai Duong's food",
    images: [
      {
        url: "/food/banner.webp",
        width: 1200,
        height: 630,
        alt: "Thumbnail Website",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Thai Duong's food",
    description: "Tinh tế làm nên hương vị của món ăn!",
    images: ["/food/banner.webp"],
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${montserrat.className} body`}>
        <Providers>
          {children}
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  )
}
