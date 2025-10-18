"use client";

import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // 🟢 Chỉ chạy trên client
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  if (!user) {
    return (
      <div className="text-center mt-10 text-gray-600">
        ⏳ Đang tải thông tin người dùng...
      </div>
    );
  }

  const roles = user.roles || [];
  const permissions = user.permissions || [];

  return (
    <div>
      <h1 className="text-3xl font-bold text-blue-700 mb-4">📊 Dashboard</h1>

      <p className="mb-6 text-gray-700 text-lg">
        Xin chào <b>{user.name || "Người dùng"}</b> 👋 <br />
        Email: <span className="text-blue-600">{user.email}</span>
      </p>

      {/* 🧩 Thông tin quyền & vai trò */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          🧾 Thông tin tài khoản
        </h2>

        <ul className="space-y-2 text-gray-700">
          <li>
            <b>ID:</b> {user.id ?? "N/A"}
          </li>
          <li>
            <b>Vai trò (Roles):</b>{" "}
            {roles.length > 0
              ? roles.join(", ")
              : "Chưa có vai trò nào được gán"}
          </li>
          <li>
            <b>Quyền hạn (Permissions):</b>
            <ul className="list-disc ml-6 mt-1">
              {permissions.length > 0 ? (
                permissions.map((p: string, i: number) => (
                  <li key={i}>{p}</li>
                ))
              ) : (
                <li>Chưa có quyền nào được gán</li>
              )}
            </ul>
          </li>
        </ul>
      </div>

      {/* Thống kê demo */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow text-center">
          <h3 className="text-lg font-semibold text-gray-700">📰 Bài viết</h3>
          <p className="text-2xl font-bold text-blue-600 mt-2">120</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow text-center">
          <h3 className="text-lg font-semibold text-gray-700">👥 Người dùng</h3>
          <p className="text-2xl font-bold text-green-600 mt-2">48</p>
        </div>
      </div>
    </div>
  );
}
