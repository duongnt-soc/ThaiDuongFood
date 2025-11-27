import axios from "axios"

import { apiBaseUrl } from "@/config"

const authService = {
  getAccessToken: () => {
    return localStorage.getItem("accessToken")
  },

  getRefreshToken: () => {
    return localStorage.getItem("refreshToken")
  },

  setAccessToken: (token: string) => {
    localStorage.setItem("accessToken", token)
  },

  setRefreshToken: (token: string) => {
    localStorage.setItem("refreshToken", token)
  },

  removeAccessToken: () => {
    localStorage.removeItem("accessToken")
  },

  removeRefreshToken: () => {
    localStorage.removeItem("refreshToken")
  },

  handleRefreshToken: async () => {
    authService.removeAccessToken()
    const refreshToken = authService.getRefreshToken()

    if (!refreshToken) throw new Error("No refresh token available")

    const result = await axios.post(
      `${apiBaseUrl}/auth/refresh-token`,
      {
        refreshToken: refreshToken,
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        withCredentials: true,
      }
    )

    const { accessToken } = result.data

    authService.setAccessToken(accessToken)

    return accessToken
  },

  // getTokenExpiryTime: (token: string) => {
  //   try {
  //     const decoded = jwtDecode(token);
  //     if (decoded.exp) {
  //       return decoded.exp * 1000; // Convert to milliseconds
  //     } else {
  //       throw new Error("Token does not have an expiry time");
  //     }
  //   } catch (error) {
  //     captureException(error);
  //     return null;
  //   }
  // },
}

export default authService
