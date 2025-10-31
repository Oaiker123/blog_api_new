import axios from "axios";
import { toast } from "sonner";

// 🔗 Cấu hình instance chính
export const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api", // Laravel API base
  withCredentials: false,
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

// ⚠️ Response interceptor → bắt lỗi 401, 403, hiển thị thông báo phù hợp
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const message =
        error.response.data?.message || "Đã xảy ra lỗi trong quá trình xử lý.";

      // 🔒 401 → Token hết hạn / chưa đăng nhập
      if (status === 401) {
        if (typeof window !== "undefined") {
          toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
      }
      // 🚫 403 → Không có quyền (KHÔNG logout)
      else if (status === 403) {
        toast.error("Bạn không có quyền truy cập nội dung này!");
      }
      // ⚠️ Các lỗi khác
      else if (status >= 400) {
        toast.error(message);
      }
    } else {
      toast.error("Không thể kết nối đến máy chủ.");
    }

    return Promise.reject(error);
  }
);
