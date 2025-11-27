import axios from "axios"

import { apiBaseUrl } from "@/config"
import eventBus, { EVENT_BUS_KEY } from "@/services/eventBus"

axios.defaults.withCredentials = true

export const clientSideAPI = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },
  withCredentials: true,
})

// Add request interceptor to modify request body before sending
clientSideAPI.interceptors.request.use(
  (config) => {
    // Add common params to URL instead of request body
    config.headers["ClientTimestamp"] = Date.now()

    if (typeof window !== "undefined" && window?.location) {
      const urlParams = new URLSearchParams(window.location.search)
      const version = urlParams.get("version")
      if (version) {
        // Append to query string
        const originalUrl = new URL(config.url || "", config.baseURL)
        originalUrl.searchParams.set("version", version)
        config.url = originalUrl.pathname + originalUrl.search
      }
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

clientSideAPI.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    if (error.response && error.response.status === 401) {
      try {
        eventBus.emit(EVENT_BUS_KEY.REFRESH_TOKEN_EXPIRED, true)
      } catch (err: any) {
        return Promise.reject(err)
      }
    }
    return Promise.reject(error)
  }
)

export const serverSideAPI = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },
  withCredentials: true,
})

// Add request interceptor to modify request body before sending
serverSideAPI.interceptors.request.use(
  (config) => {
    // Add common params to URL instead of request body
    config.headers["ClientTimestamp"] = Date.now()

    if (typeof window !== "undefined" && window?.location) {
      const urlParams = new URLSearchParams(window.location.search)
      const version = urlParams.get("version")
      if (version) {
        // Append to query string
        const originalUrl = new URL(config.url || "", config.baseURL)
        originalUrl.searchParams.set("version", version)
        config.url = originalUrl.pathname + originalUrl.search
      }
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

serverSideAPI.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    if (error.response && error.response.status === 401) {
      try {
        eventBus.emit(EVENT_BUS_KEY.REFRESH_TOKEN_EXPIRED, true)
      } catch (err: any) {
        return Promise.reject(err)
      }
    }
    return Promise.reject(error)
  }
)
