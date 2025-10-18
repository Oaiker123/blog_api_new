"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [role, setRole] = useState<string>("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const roles = user.roles || [];
    const mainRole = roles[0]; // lấy role đầu tiên
    setRole(mainRole);

    // ✅ Nếu không phải Super Admin hoặc Moderator → chặn vào admin
    if (!roles.includes("Super Admin") && !roles.includes("Moderator")) {
      router.replace("/home");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-700 text-white p-4 flex flex-col">
        <h2 className="text-xl font-bold mb-6">🛠️ Quản trị</h2>
        <nav className="flex flex-col gap-3 flex-1">
          <button
            onClick={() => router.push("/admin/dashboard")}
            className="text-left hover:bg-blue-800 p-2 rounded"
          >
            📊 Dashboard
          </button>

          {/* ✅ Moderator và Super Admin đều xem & duyệt bài được */}
          <button
            className="text-left hover:bg-blue-800 p-2 rounded"
          >
            📰 Duyệt bài viết
          </button>

          {/* ⚠️ Chỉ Super Admin mới có menu người dùng */}
          {role === "Super Admin" && (
            <button
              className="text-left hover:bg-blue-800 p-2 rounded"
            >
              👥 Quản lý người dùng
            </button>
          )}
        </nav>

        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 py-2 rounded mt-auto"
        >
          🚪 Đăng xuất
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
