"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-white overflow-hidden">
      {/* 🔵 Mảng màu nền bo tròn */}
      <div className="absolute w-[500px] h-[500px] bg-red-100 rounded-full top-[-150px] right-[-150px] blur-3xl opacity-70"></div>
      <div className="absolute w-[400px] h-[400px] bg-blue-100 rounded-full bottom-[-100px] left-[-100px] blur-3xl opacity-70"></div>
      {/* Nội dung chính */}
      <motion.h1
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-[140px] font-extrabold text-red-400 z-10"
      >
        404
      </motion.h1>
      <h2 className="text-2xl font-bold text-gray-800 mt-2">
        Trang bạn tìm không tồn tại 😢
      </h2>
      <p className="text-gray-500 mt-2 text-center max-w-md">
        Có thể đường dẫn đã bị thay đổi hoặc bạn không có quyền truy cập vào
        trang này.
      </p>
      {/* Nút quay về */}
      <motion.button
        onClick={() => router.back()}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="mt-8 border border-black px-6 py-2 font-semibold rounded-md hover:bg-black hover:text-white transition-all duration-200"
      >
        Quay lại trang trước
      </motion.button>
      {/* Nút về trang chủ */}{" "}
      <div className="mt-4">
        {" "}
        <button
          onClick={() => router.push("/home")}
          className="text-blue-600 hover:underline text-sm"
        >
          {" "}
          ← Hoặc quay về trang chủ{" "}
        </button>{" "}
      </div>
    </div>
  );
}
