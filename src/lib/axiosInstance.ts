import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // 쿠키 항상 포함
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
