import Chatbot from "@/components/Chatbot"

import Footer from "./components/Footer"
import Header from "./components/Header"

const Main = ({
  children,
}: Readonly<{
  children: React.ReactNode
}>) => {
  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      <Header />
      <main className="">{children}</main>
      <Chatbot />
      <Footer />
    </div>
  )
}

export default Main
