"use client"; // ⚠️ Bắt buộc dòng đầu tiên

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import { FaGoogle, FaFacebookF } from "react-icons/fa";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Đăng nhập (dùng toast.promise)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const promise = api.post("/auth/login", { email, password });

    toast.promise(promise, {
      loading: "🔄 Đang đăng nhập...",

      success: (res) => {
        const data = res.data;
        const token = data.token ?? data.access_token ?? data.accessToken;

        if (token) localStorage.setItem("token", token);
        if (data.user) localStorage.setItem("user", JSON.stringify(data.user));

        const roleNames = data.user?.roles?.map((r: any) => r.name || r) || [];

        // ✅ Điều hướng theo role
        if (roleNames.includes("Super Admin")) {
          router.push("/admin/dashboard");
        } else {
          router.push("/home");
        }

        return data.message || "✅ Đăng nhập thành công!";
      },

      error: (err) => {
        const status = err.response?.status;
        const msg = err.response?.data?.message || "Đăng nhập thất bại!";

        // ⚠️ Chưa xác minh email
        if (status === 403 || msg.toLowerCase().includes("chưa xác minh")) {
          const user_id = err.response?.data?.user_id;
          const pendingEmail = err.response?.data?.email || email;

          localStorage.setItem("pendingEmail", pendingEmail);
          if (user_id) localStorage.setItem("pendingUserId", String(user_id));

          setTimeout(() => {
            router.push(
              `/verify-otp?email=${encodeURIComponent(pendingEmail)}&user_id=${
                user_id ?? ""
              }`
            );
          }, 1200);

          return "⚠️ Tài khoản chưa xác minh email. Đang chuyển sang trang OTP...";
        }

        if (status === 401) {
          return "❌ Mật khẩu không chính xác. Vui lòng thử lại!";
        }

        if (status === 404) {
          return "🚫 Tài khoản không tồn tại. Vui lòng kiểm tra lại email!";
        }

        return msg || "Đăng nhập thất bại! Vui lòng thử lại.";
      },
    });
  };

  // 🟣 Đăng nhập bằng Google
  const handleSocialLogin = (provider: string) => {
    toast.loading(`🔄 Đang chuyển hướng đến ${provider}...`);
    // 🟢 Sửa dòng này:
    window.location.href = `http://localhost:8000/api/auth/${provider}/redirect`;
  };

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Đăng nhập</h2>

      <motion.form
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        onSubmit={handleLogin}
        className="space-y-4"
      >
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded"
            placeholder="example@gmail.com"
          />
        </div>

        <div className="relative">
          <label className="block text-sm mb-1">Mật khẩu</label>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded-lg pr-11 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="••••••••"
            autoComplete="current-password"
          />

          {/* 👁 Nút ẩn/hiện mật khẩu */}
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-[70%] -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors"
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            {showPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
          </button>
        </div>

        <button
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition disabled:opacity-70"
          type="submit"
        >
          {loading ? "Đang xử lý..." : "Đăng nhập"}
        </button>
      </motion.form>

      <p className="text-center text-sm text-gray-600 mt-6">
        Chưa có tài khoản?{" "}
        <button
          onClick={() => router.push("/register")}
          className="text-blue-600 hover:underline"
        >
          Đăng ký ngay
        </button>
      </p>

      <div className="flex flex-col gap-3 mt-4">
        <button
          onClick={() => handleSocialLogin("google")}
          className="flex items-center justify-center w-full border py-2 rounded hover:bg-gray-100 transition"
        >
          <FaGoogle className="mr-2 text-red-500" /> Đăng nhập với Google
        </button>
        <button
          onClick={() => handleSocialLogin("facebook")}
          className="flex items-center justify-center w-full border py-2 rounded hover:bg-gray-100 transition"
        >
          <FaFacebookF className="mr-2 text-blue-600" /> Đăng nhập với Facebook
        </button>
      </div>
    </div>
  );
}
