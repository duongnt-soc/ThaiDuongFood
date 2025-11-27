import axios from "axios"

const mlApiBaseUrl = "http://localhost:8001"

const mlApiClient = axios.create({
  baseURL: mlApiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
})

export default mlApiClient
