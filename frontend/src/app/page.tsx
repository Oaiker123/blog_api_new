"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function RootRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const userParam = searchParams.get("user");

    if (token && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));

        // ✅ Lưu thông tin vào localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        // 🔁 Chuyển hướng sang /home
        router.replace("/home");
      } catch (err) {
        console.error("Lỗi khi parse user:", err);
      }
    } else {
      // Nếu không có token thì vẫn vào /home
      router.replace("/home");
    }
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-500 text-lg">Đang xử lý đăng nhập...</p>
    </div>
  );
}
