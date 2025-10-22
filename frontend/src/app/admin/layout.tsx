"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import { Menu, X } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // mobile open
  const [isCollapsed, setIsCollapsed] = useState(false); // desktop collapsed
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    // xác định desktop hoặc mobile
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const roles = user.roles || [];
    if (!roles.includes("Super Admin") && !roles.includes("Moderator")) {
      router.replace("/home");
    }
  }, [router]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isDesktop={isDesktop}
      />

      {/* Main content: chừa chỗ cho sidebar trên desktop */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isDesktop
            ? isCollapsed
              ? "lg:ml-[80px]"
              : "lg:ml-[260px]"
            : "lg:ml-0"
        }`}
      >
        {/* Header */}
        <header className="flex items-center justify-between bg-white shadow-sm px-4 py-3 sticky top-0 z-30">
          {/* mobile menu button */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden bg-blue-600 text-white p-2 rounded"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          {/* desktop collapse toggle */}
          <button
            onClick={() => setIsCollapsed((s) => !s)}
            className="hidden lg:inline-flex items-center justify-center bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
            title={isCollapsed ? "Mở rộng menu" : "Thu gọn menu"}
          >
            {isCollapsed ? <Menu size={20} /> : <X size={20} />}
          </button>

          <h1 className="text-lg font-semibold">Bảng điều khiển</h1>
        </header>

        {/* Nội dung chính */}
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
