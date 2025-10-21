"use client";
import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("user_id");
  const email = searchParams.get("email");

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // ✅ Lấy lại OTP tạm khi reload
  useEffect(() => {
    const savedOtp = localStorage.getItem("tempOTP");
    if (savedOtp) setOtp(savedOtp.split(""));
  }, []);

  // ✅ Lưu OTP mỗi khi thay đổi
  useEffect(() => {
    localStorage.setItem("tempOTP", otp.join(""));
  }, [otp]);

  // ⏱ Countdown khi gửi lại OTP
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000
      );
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // ✅ Xử lý nhập số và điều hướng giữa các ô
  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return; // chỉ cho nhập 1 ký tự số
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // tự động nhảy sang ô kế tiếp
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // ✅ Xác minh OTP
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return toast.error("Thiếu thông tin user!");

    const otpCode = otp.join("");
    if (!/^\d{6}$/.test(otpCode)) return toast.error("OTP phải gồm 6 số!");

    setLoading(true);

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/auth/verify-otp",
        {
          user_id: userId,
          otp: otpCode,
        }
      );
      toast.success(res.data.message + " 🎉");

      // ✅ Xóa OTP lưu tạm
      localStorage.removeItem("tempOTP");

      setTimeout(() => router.push("/login"), 1500);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Xác minh thất bại");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Gửi lại OTP
  const handleResendOtp = async () => {
    if (!userId) return toast.error("Thiếu thông tin user!");
    if (resendCooldown > 0) return;

    setLoading(true);
    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/auth/resend-otp",
        {
          user_id: userId,
        }
      );
      toast.success(res.data.message);
      setResendCooldown(30);
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
        className="space-y-6"
      >
        <h2 className="text-2xl font-semibold text-center mb-2">
          Xác minh OTP
        </h2>
        <p className="text-center text-gray-600">
          Nhập mã OTP đã gửi tới email: <b>{email}</b>
        </p>

        {/* ✅ Giao diện 6 ô nhập OTP */}
        <div className="flex justify-between gap-2 mt-4">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          ))}
        </div>

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
          disabled={loading || resendCooldown > 0}
          className="w-full border border-gray-400 text-gray-700 py-3 rounded-lg hover:bg-gray-100 transition"
        >
          {resendCooldown > 0
            ? `Gửi lại OTP sau ${resendCooldown}s`
            : "Gửi lại OTP"}
        </button>

        <p className="text-center text-sm text-gray-600 mt-4">
          Chưa có tài khoản?{" "}
          <button
           type="button"
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
