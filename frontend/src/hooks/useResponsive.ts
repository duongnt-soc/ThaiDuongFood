import { useState, useEffect } from "react"

export enum SCREEN_SIZES {
  BASE = 0,
  MD = 480,
  LG = 768,
  XL = 1024,
  "XL2" = 1280,
  "2XL" = 1440,
}

const createMediaQueryLists = () => {
  return {
    "2XL": window.matchMedia(`(min-width: ${SCREEN_SIZES["2XL"]}px)`),
    XL2: window.matchMedia(
      `(min-width: ${SCREEN_SIZES.XL2}px) and (max-width: ${SCREEN_SIZES["2XL"] - 1}px)`
    ),
    XL: window.matchMedia(
      `(min-width: ${SCREEN_SIZES.XL}px) and (max-width: ${SCREEN_SIZES.XL2 - 1}px)`
    ),
    LG: window.matchMedia(
      `(min-width: ${SCREEN_SIZES.LG}px) and (max-width: ${SCREEN_SIZES.XL - 1}px)`
    ),
    MD: window.matchMedia(
      `(min-width: ${SCREEN_SIZES.MD}px) and (max-width: ${SCREEN_SIZES.LG - 1}px)`
    ),
    BASE: window.matchMedia(`(max-width: ${SCREEN_SIZES.MD - 1}px)`),
  }
}

const useResponsive = () => {
  const [screenSize, setScreenSize] = useState<SCREEN_SIZES>(SCREEN_SIZES["2XL"])

  useEffect(() => {
    const mediaQueryLists = createMediaQueryLists()

    const handleResize = () => {
      if (mediaQueryLists["2XL"].matches) {
        setScreenSize(SCREEN_SIZES["2XL"])
      } else if (mediaQueryLists.XL2.matches) {
        setScreenSize(SCREEN_SIZES.XL2)
      } else if (mediaQueryLists.XL.matches) {
        setScreenSize(SCREEN_SIZES.XL)
      } else if (mediaQueryLists.LG.matches) {
        setScreenSize(SCREEN_SIZES.LG)
      } else if (mediaQueryLists.MD.matches) {
        setScreenSize(SCREEN_SIZES.MD)
      } else if (mediaQueryLists.BASE.matches) {
        setScreenSize(SCREEN_SIZES.BASE)
      }
    }

    Object.values(mediaQueryLists).forEach((mql) => {
      mql.addEventListener("change", handleResize)
    })

    handleResize() // Initial check

    return () => {
      Object.values(mediaQueryLists).forEach((mql) => {
        mql.removeEventListener("change", handleResize)
      })
    }
  }, [])

  return screenSize
}

export default useResponsive
