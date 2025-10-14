"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SocialCallback() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const user = params.get("user");

    if (token && user) {
      localStorage.setItem("token", token);
      localStorage.setItem("user", user);

      toast.success("🎉 Đăng nhập thành công!");
      router.push("/dashboard");
    } else {
      toast.error("❌ Không nhận được thông tin đăng nhập!");
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Đang xử lý đăng nhập...</p>
    </div>
  );
}
