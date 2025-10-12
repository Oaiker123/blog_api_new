"use client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("user_id");
  const email = searchParams.get("email");

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Xác minh OTP
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/auth/verify-otp", {
        user_id: userId,
        otp,
      });
      toast.success(res.data.message + " 🎉");
      setTimeout(() => router.push("/login"), 1500);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Xác minh thất bại");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Gửi lại OTP
  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/auth/resend-otp",
        {
          user_id: userId,
        }
      );
      toast.success(res.data.message);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Không thể gửi lại OTP");
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
        onSubmit={handleVerify}
        className="space-y-4"
      >
        <h2 className="text-2xl font-semibold text-center mb-4">
          Xác minh OTP
        </h2>
        <p className="text-center text-gray-600">
          Nhập mã OTP đã gửi tới email: <b>{email}</b>
        </p>

        <input
          type="text"
          placeholder="Nhập mã OTP (6 số)"
          className="w-full p-3 border rounded-lg text-center tracking-widest"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
        >
          {loading ? "Đang xác minh..." : "Xác minh OTP"}
        </button>

        <button
          type="button"
          onClick={handleResendOtp}
          disabled={loading}
          className="w-full border border-gray-400 text-gray-700 py-3 rounded-lg hover:bg-gray-100 transition"
        >
          Gửi lại OTP
        </button>

        <p className="text-center text-sm text-gray-600 mt-4">
          Chưa có tài khoản?{" "}
          <button
            onClick={() => router.push("/register")}
            className="text-blue-600 hover:underline"
          >
            Quay lại đăng ký
          </button>
        </p>
      </motion.form>
    </div>
  );
}
