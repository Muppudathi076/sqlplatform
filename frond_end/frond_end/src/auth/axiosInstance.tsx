import axios from "axios"
import toast from "react-hot-toast"

const API_URL = import.meta.env.VITE_API_URL
console.log(import.meta.env.VITE_API_URL)
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Attach token to every request automatically (skip public routes)
const PUBLIC_ROUTES = ["/login/", "/register/"]

axiosInstance.interceptors.request.use(
  (config) => {
    const url = config.url || ""
    const isPublic = PUBLIC_ROUTES.some((route) => url.includes(route))
    if (!isPublic) {
      const token = localStorage.getItem("access_token")
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Global response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 403) {
      toast.error("Session closed. Please login again.");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token"); // if exists
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
)

export default axiosInstance