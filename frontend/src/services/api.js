// client/src/services/api.js

import axios from "axios"

const API = axios.create({
  baseURL: "http://localhost:5000/api",
})

// Attach token to every request automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("craveo_token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default API