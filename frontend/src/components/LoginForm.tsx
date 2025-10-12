"use client"; // ⚠️ Bắt buộc dòng đầu tiên

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import { FaGoogle, FaFacebookF } from "react-icons/fa";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("🔄 Đang đăng nhập...");

    try {
      // ✅ Gửi request login
      const res = await api.post("/auth/login", { email, password });
      const data = res.data;

      // ✅ Lưu token
      const token = data.token ?? data.access_token ?? data.accessToken;
      if (token) localStorage.setItem("token", token);

      // ✅ Lưu thông tin user
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));

      setMessage(data.message || "✅ Đăng nhập thành công!");
      router.push("/dashboard");
    } catch (err: any) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || "Đăng nhập thất bại!";

      // ⚠️ Nếu tài khoản chưa xác minh
      if (
        status === 403 ||
        msg.toLowerCase().includes("chua xac minh") ||
        msg.toLowerCase().includes("chưa xác minh")
      ) {
        const user_id = err.response?.data?.user_id;
        const pendingEmail = err.response?.data?.email || email;

        localStorage.setItem("pendingEmail", pendingEmail);
        if (user_id) localStorage.setItem("pendingUserId", String(user_id));

        setMessage("⚠️ Tài khoản chưa xác minh. Đang chuyển sang trang OTP...");

        // ✅ Không console.error nữa — chỉ log nhẹ nếu cần
        console.warn("User chưa xác minh, chuyển hướng verify OTP...");

        setTimeout(() => {
          router.push(
            `/verify-otp?email=${encodeURIComponent(pendingEmail)}&user_id=${
              user_id ?? ""
            }`
          );
        }, 1000);
      } else {
        console.error("Lỗi đăng nhập:", err);
        setMessage(msg);
      }
    }
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

        <div>
          <label className="block text-sm mb-1">Mật khẩu</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded"
            placeholder="••••••••"
          />
        </div>

        <button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition"
          type="submit"
        >
          Đăng nhập
        </button>

        {message && (
          <p className="text-sm mt-2 text-center text-gray-700">{message}</p>
        )}
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
          className="flex items-center justify-center w-full border py-2 rounded hover:bg-gray-100 transition"
        >
          <FaGoogle className="mr-2 text-red-500" /> Đăng nhập với Google
        </button>
        <button
          className="flex items-center justify-center w-full border py-2 rounded hover:bg-gray-100 transition"
        >
          <FaFacebookF className="mr-2 text-blue-600" /> Đăng nhập với Facebook
        </button>
      </div>
    </div>
  );
}
