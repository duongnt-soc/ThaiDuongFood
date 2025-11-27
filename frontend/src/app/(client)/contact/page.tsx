"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Phone, Clock, MapPin } from "lucide-react"

import { Section, SectionTitle } from "@/components/shared/Section"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

const ContactForm = () => {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    setTimeout(() => {
      toast.success("Your message has been sent successfully!")
      setIsLoading(false)
      ;(e.target as HTMLFormElement).reset()
    }, 1000)
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Input name="name" placeholder="Name" required />
        <Input name="email" type="email" placeholder="Email" required />
        <Input name="subject" placeholder="Subject" className="sm:col-span-2" required />
        <Textarea
          name="message"
          placeholder="Message"
          className="min-h-[150px] sm:col-span-2"
          required
        />
      </div>
      <Button
        type="submit"
        size="lg"
        className="mt-8 w-full bg-[#AD343E] hover:bg-[#932b34]"
        disabled={isLoading}
      >
        {isLoading ? "Sending..." : "Send"}
      </Button>
    </form>
  )
}

const ContactInfo = () => {
  const contactDetails = [
    {
      icon: <Phone size={24} className="text-[#AD343E]" />,
      title: "Call Us:",
      info: "0967083126",
    },
    {
      icon: <Clock size={24} className="text-[#AD343E]" />,
      title: "Hours:",
      info: "Mon-Fri: 11am - 8pm, Sat-Sun: 9am - 10pm",
    },
    {
      icon: <MapPin size={24} className="text-[#AD343E]" />,
      title: "Our Location:",
      info: "123 Bridge Street, Hanoi, Vietnam",
    },
  ]

  return (
    <div className="mt-24 grid grid-cols-1 gap-8 text-center md:grid-cols-3">
      {contactDetails.map((detail) => (
        <div key={detail.title}>
          <div className="mb-4 inline-block rounded-full bg-gray-100 p-4">{detail.icon}</div>
          <h3 className="text-lg font-semibold">{detail.title}</h3>
          <p className="text-gray-600">{detail.info}</p>
        </div>
      ))}
      <h3 className="mb-4 text-xl font-semibold text-white">Email</h3>
      <p className="text-gray-600">duongnt@hn.soc.one</p>
    </div>
  )
}

export default function ContactPage() {
  return (
    <>
      <Section>
        <SectionTitle
          title="Contact Us"
          subtitle="Chúng tôi xem xét tất cả các động lực thay đổi, cung cấp cho bạn các thành phần bạn cần để thay đổi nhằm tạo ra điều thực sự xảy ra."
        />
        <ContactForm />
        <ContactInfo />
      </Section>

      {/* Map Section */}
      <div className="h-[500px] w-full">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d950.3326455920962!2d105.71674405807903!3d21.068728521579132!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2s!4v1758524991075!5m2!1sen!2s"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen={false}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </>
  )
}
