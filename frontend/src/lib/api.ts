import axios from "axios";

export const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  withCredentials: false, // nếu cần cookie/sanctum = true (và cấu hình CORS)
  headers: {
    Accept: "application/json",
  },
});

// Request interceptor: attach token from localStorage
api.interceptors.request.use((config) => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    // ignore
  }
  return config;
});
