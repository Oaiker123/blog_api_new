"use client";

import { useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    // ✅ Gọi API test (chỉ để kiểm tra token)
    api
      .get("/test")
      .then((res) => console.log("✅ API response:", res.data))
      .catch((err) => console.error("❌ API error:", err));
  }, []);

  // 🟢 Hàm Logout
  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      toast.success("✅ Đăng xuất thành công!");
      router.push("/login");
    } catch (error: any) {
      console.error(error);
      toast.error("❌ Lỗi khi đăng xuất!");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-xl font-semibold">Test API Page</h1>
      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
      >
        Đăng xuất
      </button>
    </div>
  );
}
