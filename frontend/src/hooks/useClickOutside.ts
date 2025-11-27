import { useEffect, RefObject } from "react"

export function useClickOutside(
  contentRef: RefObject<HTMLElement>,
  toggleRef: RefObject<HTMLElement>,
  callback: (params: boolean) => void
): void {
  const handleMouseDown = (e: MouseEvent | TouchEvent) => {
    if (toggleRef.current && toggleRef.current.contains(e.target as Node)) {
      callback(true)
    } else if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
      callback(false)
    }
  }

  useEffect(() => {
    document.addEventListener("mousedown", handleMouseDown)

    return () => document.removeEventListener("mousedown", handleMouseDown)
  }, [])
}
