"use client";

import { useEffect } from "react";
import { api } from "@/lib/api";
import Header from "./components/Header";

export default function HomePage() {
  useEffect(() => {
    api
      .get("/test")
      .then((res) => console.log("✅ API response:", res.data))
      .catch((err) => console.error("❌ API error:", err));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* 🔹 Header tái sử dụng */}
      <Header />

      {/* 🔹 Nội dung chính */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">🎉 Chào mừng đến trang Home</h1>
        <p className="text-gray-600 mb-6">
          Đây là khu vực chính của người dùng sau khi đăng nhập.
        </p>

        <button
          onClick={() => console.log("Đi đến bài viết...")}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Xem bài viết
        </button>
      </main>
    </div>
  );
}
