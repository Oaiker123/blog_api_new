"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Mail, Loader2, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/auth/forgot-password", { email });
      toast.success(res.data.message);
      router.push(`/verify-reset-otp?email=${email}`);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const error = err as { response?: { data?: { message?: string } } };
        toast.error(error.response?.data?.message || "Lỗi gửi OTP!");
      } else {
        toast.error("Lỗi gửi OTP!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-md border border-gray-200 shadow-xl rounded-3xl p-8 transition hover:shadow-2xl">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Quên mật khẩu?
        </h1>
        <p className="text-center text-gray-500 text-sm mb-8">
          Nhập email của bạn để nhận mã OTP khôi phục mật khẩu.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Địa chỉ Email
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ví dụ: email@domain.com"
                required
                className="w-full border border-gray-300 rounded-xl pl-10 pr-3 py-3 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 rounded-xl transition hover:opacity-90 ${
              loading ? "opacity-80 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Đang gửi mã...
              </>
            ) : (
              "Gửi mã OTP"
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => router.push("/login")}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition"
          >
            <ArrowLeft size={16} />
            Quay lại đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
}