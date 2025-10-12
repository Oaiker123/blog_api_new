"use client";
import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [loading, setLoading] = useState(false);

  // ✅ Đăng ký
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/auth/register", form);
      const { user_id, message } = res.data;

      toast.success(message);
      // 👉 chuyển sang trang verify OTP + truyền user_id và email
      router.push(`/verify-otp?user_id=${user_id}&email=${encodeURIComponent(form.email)}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
      <motion.form
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        onSubmit={handleRegister}
        className="space-y-4"
      >
        <h2 className="text-2xl font-semibold text-center mb-4">Đăng ký tài khoản</h2>

        <input
          type="text"
          placeholder="Họ và tên"
          className="w-full p-3 border rounded-lg"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 border rounded-lg"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          className="w-full p-3 border rounded-lg"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Xác nhận mật khẩu"
          className="w-full p-3 border rounded-lg"
          value={form.password_confirmation}
          onChange={(e) =>
            setForm({ ...form, password_confirmation: e.target.value })
          }
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
        >
          {loading ? "Đang xử lý..." : "Đăng ký"}
        </button>

        <p className="text-center text-sm text-gray-600 mt-4">
          Đã có tài khoản?{" "}
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="text-blue-600 hover:underline"
          >
            Đăng nhập ngay
          </button>
        </p>
      </motion.form>
    </div>
  );
}
