import axios from "axios"

// create reusable axios instance
// baseURL is automatically added to every request 
const API = axios.create({
  baseURL: "http://localhost:5000/api"
})

// request interceptor
// runs before evry API request
API.interceptors.request.use((config) => {
  // get JWT token from localStorage
  const token = localStorage.getItem("craveo_token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  // return modified request config
  return config
})

export default API