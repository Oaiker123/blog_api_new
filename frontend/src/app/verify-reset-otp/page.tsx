"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { api } from "@/lib/api";

export default function VerifyResetOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // ⏱ Countdown resend OTP
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // ✅ Xử lý nhập số và auto focus
  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return; // chỉ cho nhập số
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // ✅ Gửi lại OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    if (!email) return toast.error("Không tìm thấy email.");

    setLoading(true);
    try {
      const res = await api.post("/auth/forgot-password", { email });
      toast.success(res.data.message || "Đã gửi lại mã OTP!");
      setResendCooldown(30);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const error = err as { response?: { data?: { message?: string } } };
        toast.error(error.response?.data?.message || "Không thể gửi lại OTP.");
      } else {
        toast.error("Không thể gửi lại OTP.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Xác minh OTP
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (!/^\d{6}$/.test(otpCode)) return toast.error("OTP phải gồm 6 số!");

    setLoading(true);
    try {
      const res = await api.post("/auth/verify-reset-otp", { email, otp: otpCode });
      toast.success(res.data.message || "Xác minh thành công!");
      router.push(`/reset-password?email=${email}`);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const error = err as { response?: { data?: { message?: string } } };
        toast.error(error.response?.data?.message || "OTP không hợp lệ!");
      } else {
        toast.error("OTP không hợp lệ!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg mx-auto mt-20">
      <motion.form
        onSubmit={handleVerify}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <h2 className="text-2xl font-semibold text-center mb-2">Xác minh OTP</h2>
        <p className="text-center text-gray-600">
          Nhập mã OTP đã gửi tới email: <b>{email}</b>
        </p>

        {/* ✅ Giao diện 6 ô OTP */}
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

        {/* ✅ Nút xác minh */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
        >
          {loading ? "Đang xác minh..." : "Xác minh OTP"}
        </button>

        {/* ✅ Gửi lại OTP */}
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