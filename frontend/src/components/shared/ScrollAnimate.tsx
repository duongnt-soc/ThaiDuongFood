// src/components/shared/ScrollAnimate.tsx
"use client"

import { useInView } from "react-intersection-observer"

import { cn } from "@/lib/utils"

interface ScrollAnimateProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export const ScrollAnimate = ({ children, className }: ScrollAnimateProps) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out motion-reduce:transition-none",
        inView ? "translate-y-0 opacity-100" : "translate-y-14 opacity-0",
        className
      )}
      style={{ transitionDelay: `100ms` }}
    >
      {children}
    </div>
  )
}
