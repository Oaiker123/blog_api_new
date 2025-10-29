// lib/api.ts
import axios from "axios";

// 🔗 Cấu hình instance chính
export const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api", // Laravel API base
  withCredentials: false, // Chỉ bật true nếu dùng Sanctum cookie
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// 🧩 Request interceptor → tự động gắn token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ⚠️ Response interceptor → bắt lỗi 401, 403
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;

      // Nếu token hết hạn hoặc không hợp lệ → đẩy về login
      if (status === 401 || status === 403) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);
