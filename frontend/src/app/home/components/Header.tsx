"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

const menuItems = [
  { label: "Trang chủ", path: "/home" },
  { label: "Bài viết", path: "/posts" },
  { label: "Người dùng", path: "/users" },
];

export default function Header() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen size
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3 gap-6">
        {/* Logo */}
        <div
          onClick={() => router.push("/home")}
          className="text-2xl font-extrabold text-blue-600 cursor-pointer select-none"
        >
          My<span className="text-gray-900">App</span>
        </div>

        {/* Menu desktop */}
        {!isMobile && (
          <nav className="flex-1 flex justify-center items-center gap-12 text-gray-700 font-medium">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className="hover:text-blue-600 transition-colors px-3 py-2 rounded-lg"
              >
                {item.label}
              </button>
            ))}
          </nav>
        )}

        {/* Logout desktop */}
        {!isMobile && (
          <div className="flex justify-end">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-lg shadow-sm transition-all"
            >
              <LogOut size={18} /> <span>Đăng xuất</span>
            </button>
          </div>
        )}

        {/* Toggle mobile menu */}
        {isMobile && (
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center justify-center text-gray-700 hover:text-blue-600 transition"
            aria-label={menuOpen ? "Đóng menu" : "Mở menu"}
          >
            {menuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        )}
      </div>

      {/* Menu mobile */}
      {isMobile && menuOpen && (
        <nav className="bg-white border-t border-gray-100 flex flex-col items-center py-4 space-y-4 animate-fadeIn">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                router.push(item.path);
                setMenuOpen(false);
              }}
              className="hover:text-blue-600 transition-colors px-3 py-2 rounded-lg w-full text-center"
            >
              {item.label}
            </button>
          ))}

          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-sm transition-all w-full"
          >
            <LogOut size={18} /> Đăng xuất
          </button>
        </nav>
      )}
    </header>
  );
}
