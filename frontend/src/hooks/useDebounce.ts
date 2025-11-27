import { useState, useEffect } from "react"

const useDebounce = <T>(initialValue: T, time: number = 1000, initialLoading: boolean = false) => {
  const [value, setValue] = useState<T>(initialValue)
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue)
  const [isLoading, setIsLoading] = useState<boolean>(initialLoading)
  useEffect(() => {
    const debounce = setTimeout(() => {
      setDebouncedValue(value)
      setIsLoading(true)
    }, time)
    return () => {
      clearTimeout(debounce)
    }
  }, [value, time])

  return [debouncedValue, value, setValue, isLoading, setIsLoading] as const
}

export default useDebounce
