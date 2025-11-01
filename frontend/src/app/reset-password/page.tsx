"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Eye, EyeOff, Lock } from "lucide-react";
import { motion } from "framer-motion";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email");

  // 🔒 Đánh giá độ mạnh mật khẩu
  const getPasswordStrength = (pass: string) => {
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass)) strength++;
    return strength;
  };
  const strength = getPasswordStrength(password);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/reset-password", {
        email,
        password,
        password_confirmation: confirm,
      });
      toast.success(res.data.message);
      router.push("/login");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi đặt lại mật khẩu!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto mb-3 flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600">
            <Lock size={24} />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">
            Đặt lại mật khẩu
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Vui lòng nhập mật khẩu mới cho tài khoản <b>{email}</b>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleReset} className="space-y-5">
          {/* Mật khẩu mới */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu mới
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Thanh strength bar */}
            {password && (
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width:
                      strength === 1
                        ? "25%"
                        : strength === 2
                        ? "50%"
                        : strength === 3
                        ? "75%"
                        : strength === 4
                        ? "100%"
                        : "0%",
                  }}
                  transition={{ duration: 0.4 }}
                  className={`h-full rounded-full ${
                    strength <= 1
                      ? "bg-red-500"
                      : strength === 2
                      ? "bg-orange-400"
                      : strength === 3
                      ? "bg-yellow-400"
                      : "bg-gradient-to-r from-green-400 to-green-600"
                  }`}
                />
              </div>
            )}

            <p className="text-xs text-gray-500 mt-1">
              Nên có ít nhất 8 ký tự, bao gồm chữ hoa, số và ký tự đặc biệt.
            </p>
          </div>

          {/* Xác nhận mật khẩu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Xác nhận mật khẩu
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Nhập lại mật khẩu"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-3 rounded-lg text-white font-medium shadow transition ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
          </motion.button>

          <p className="text-center text-sm text-gray-600 mt-4">
            Nhớ mật khẩu cũ?{" "}
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="text-blue-600 hover:underline font-medium"
            >
              Quay lại đăng nhập
            </button>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
