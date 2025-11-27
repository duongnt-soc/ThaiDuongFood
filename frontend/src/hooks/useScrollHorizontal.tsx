import { RefObject, useEffect, useState, useCallback } from "react"

const useScrollHorizontal = (forwardedRef: RefObject<any>) => {
  const [isMouseDown, setIsMouseDown] = useState<boolean>(false)
  const [startX, setStartX] = useState<number>(0)
  const [scrollLeft, setScrollLeft] = useState<number>(0)
  const [isScroll, setIsScroll] = useState<boolean>(false)

  const onMouseDown = (e: any) => {
    setIsMouseDown(true)
    if (forwardedRef.current) {
      setStartX(e.pageX - forwardedRef.current.offsetLeft)
      setScrollLeft(forwardedRef.current.scrollLeft)
    }
  }

  // Memoize onMouseUp to prevent recreating it on every render
  const onMouseUp = useCallback(
    (callbackFn?: () => void) => {
      if (isMouseDown && !isScroll && typeof callbackFn === "function") {
        callbackFn()
      }
      setIsMouseDown(false)
    },
    [isMouseDown, isScroll]
  )

  const onMouseMove = (e: any) => {
    if (!isMouseDown) return
    e.preventDefault()
    if (forwardedRef.current) {
      setIsScroll(true)
      const x = e.pageX - forwardedRef.current.offsetLeft
      const walk = (x - startX) * 2 // Adjust the scroll speed
      forwardedRef.current.scrollLeft = scrollLeft - walk
    }
  }

  useEffect(() => {
    const currentRef = forwardedRef.current
    const handleMouseLeave = () => onMouseUp()

    currentRef?.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      currentRef?.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [forwardedRef, onMouseUp])

  return { isMouseDown, isScroll, onMouseDown, onMouseUp, onMouseMove }
}

export default useScrollHorizontal
