import { useEffect, useState, useRef } from "react"

interface UseHoverOutsideResult {
  isHovered: boolean
  ref: React.RefObject<HTMLDivElement>
}

interface UseHoverOutsideProps {
  initialState?: boolean
  enable?: boolean
}

function useHoverOutside({
  initialState = false,
  enable = true,
}: UseHoverOutsideProps): UseHoverOutsideResult {
  const [isHovered, setIsHovered] = useState<boolean>(initialState)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!enable) {
      // If hover detection is disabled, don't add any event listeners
      return
    }

    const handleOutsideHover = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsHovered(false) // User hovered outside
      } else {
        setIsHovered(true)
      }
    }

    // Add the event listener to track mouse movement
    document.addEventListener("mousemove", handleOutsideHover)

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener("mousemove", handleOutsideHover)
    }
  }, [enable]) // Re-run the effect if the `enable` value changes

  return { isHovered, ref }
}

export default useHoverOutside
