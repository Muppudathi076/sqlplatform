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