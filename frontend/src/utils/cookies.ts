import Cookies from "js-cookie"

export const COOKIE_KEY = {
  THEME_INFO: "theme_info",
  IS_LOGIN: "is_login",
  VERSION: "version",
  FEATURE_FLAGS: "feature_flags",
  STORAGE_VERSION: "storage_version",
  UUID: "uuid",
} as const

export const setCookie = (key: string, value: any, options?: Cookies.CookieAttributes) => {
  Cookies.set(key, JSON.stringify(value), options)
}

export const safeParseJSON = (value: string) => {
  try {
    const parsedValue = JSON.parse(value)
    return parsedValue
  } catch (error) {
    console.error("Lỗi khi phân tích cú pháp JSON:", error)
    return value
  }
}

export const getCookie = <T = any>(key: string): T | undefined => {
  const cookieValue = Cookies.get(key)
  return cookieValue ? (safeParseJSON(cookieValue) as T) : undefined
}

export const removeCookie = (key: string) => {
  Cookies.remove(key)
}
