"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import { FaGoogle, FaFacebookF } from "react-icons/fa";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { toast } from "sonner";

// 🧠 Mã hóa & Giải mã mật khẩu (base64)
const encrypt = (text: string) => {
  try {
    return btoa(text);
  } catch {
    return text;
  }
};

const decrypt = (text: string) => {
  try {
    return atob(text);
  } catch {
    return text;
  }
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // 🧩 Lấy dữ liệu Remember Me
  useEffect(() => {
    const savedEmail = localStorage.getItem("loginEmail");
    const savedPassword = localStorage.getItem("loginPassword");
    const savedRemember = localStorage.getItem("rememberMe") === "true";

    if (savedEmail) setEmail(savedEmail);
    if (savedPassword) setPassword(decrypt(savedPassword));
    setRememberMe(savedRemember);
  }, []);

  useEffect(() => {
    localStorage.setItem("loginEmail", email);
  }, [email]);

  useEffect(() => {
    localStorage.setItem("loginPassword", encrypt(password));
  }, [password]);

  // ✅ Đăng nhập thủ công
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const promise = api.post("/auth/login", { email, password });

    toast.promise(
      promise
        .then((res) => {
          setLoading(false);
          return res;
        })
        .catch((err) => {
          setLoading(false);
          throw err;
        }),
      {
        loading: "🔄 Đang đăng nhập...",
        success: (res) => {
          const data = res.data;
          const token = data.token ?? data.access_token ?? data.accessToken;

          if (token) localStorage.setItem("token", token);
          if (data.user)
            localStorage.setItem("user", JSON.stringify(data.user));

          if (rememberMe) {
            localStorage.setItem("rememberMe", "true");
            localStorage.setItem("loginEmail", email);
            localStorage.setItem("loginPassword", encrypt(password));
          } else {
            localStorage.removeItem("loginEmail");
            localStorage.removeItem("loginPassword");
            localStorage.removeItem("rememberMe");
          }

          const roleNames =
            data.user?.roles?.map((r: any) => r.name || r) || [];
          const permissionNames = data.user?.permissions || [];

          const canAccessAdmin =
            roleNames.includes("Super Admin") ||
            permissionNames.includes("access-admin");

          router.push(canAccessAdmin ? "/admin/dashboard" : "/home");
          return data.message || "✅ Đăng nhập thành công!";
        },
        error: (err) => {
          const status = err.response?.status;
          const msg = err.response?.data?.message || "Đăng nhập thất bại!";

          if (status === 403 || msg.toLowerCase().includes("chưa xác minh")) {
            const user_id = err.response?.data?.user_id;
            const pendingEmail = err.response?.data?.email || email;

            localStorage.setItem("pendingEmail", pendingEmail);
            if (user_id) localStorage.setItem("pendingUserId", String(user_id));

            setTimeout(() => {
              router.push(
                `/verify-otp?email=${encodeURIComponent(
                  pendingEmail
                )}&user_id=${user_id ?? ""}`
              );
            }, 1200);

            return "⚠️ Tài khoản chưa xác minh email. Đang chuyển sang OTP...";
          }

          if (status === 401) return "❌ Mật khẩu không chính xác!";
          if (status === 404) return "🚫 Tài khoản không tồn tại!";
          return msg || "Đăng nhập thất bại!";
        },
      }
    );
  };

  // 🟣 Đăng nhập Google/Facebook
  const handleSocialLogin = (provider: string) => {
    toast.loading(`🔄 Đang chuyển hướng đến ${provider}...`);
    window.location.href = `http://localhost:8000/api/auth/${provider}/redirect`;
  };

  // ⚡️ Xử lý redirect sau khi đăng nhập Google/Facebook thành công
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const user = urlParams.get("user");

    if (token && user) {
      try {
        localStorage.setItem("token", token);
        localStorage.setItem("user", user);
        toast.success("🎉 Đăng nhập thành công!");

        const parsedUser = JSON.parse(user);
        const roleNames = parsedUser?.roles?.map((r: any) => r.name || r) || [];
        const permissionNames = parsedUser?.permissions || [];

        const canAccessAdmin =
          roleNames.includes("Super Admin") ||
          permissionNames.includes("access-admin");

        router.push(canAccessAdmin ? "/admin/dashboard" : "/home");
      } catch (e) {
        console.error("❌ Lỗi parse user:", e);
        toast.error("Dữ liệu đăng nhập không hợp lệ!");
        router.push("/login");
      }
    }
  }, [router]);

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
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-[70%] -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors"
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            {showPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
          </button>
        </div>

        <div className="flex items-center justify-between text-sm mt-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4"
            />
            Ghi nhớ đăng nhập
          </label>
        </div>

        <button
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition disabled:opacity-70"
          type="submit"
        >
          {loading ? "Đang xử lý..." : "Đăng nhập"}
        </button>
      </motion.form>

      <div className="mt-8 space-y-3 text-center text-sm text-gray-600">
        <p>
          Chưa có tài khoản?{" "}
          <button
            onClick={() => router.push("/register")}
            className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            Đăng ký ngay
          </button>
        </p>

        <div className="flex items-center justify-center gap-2 text-gray-400 text-xs">
          <div className="h-px w-10 bg-gray-300"></div>
          <span>hoặc</span>
          <div className="h-px w-10 bg-gray-300"></div>
        </div>

        <p>
          Quên mật khẩu?{" "}
          <button
            onClick={() => router.push("/forgot-password")}
            className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            Khôi phục ngay
          </button>
        </p>
      </div>

      <div className="flex flex-col gap-3 mt-4">
        <button
          onClick={() => handleSocialLogin("google")}
          className="flex items-center justify-center w-full border py-2 rounded hover:bg-gray-100 transition"
        >
          <FaGoogle className="mr-2 text-red-500" /> Đăng nhập với Google
        </button>
        {/* <button
          onClick={() => handleSocialLogin("facebook")}
          className="flex items-center justify-center w-full border py-2 rounded hover:bg-gray-100 transition"
        >
          <FaFacebookF className="mr-2 text-blue-600" /> Đăng nhập với Facebook
        </button> */}
      </div>
    </div>
  );
}
