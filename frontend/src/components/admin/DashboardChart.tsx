"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { PieLabelRenderProps } from "recharts";
import { api } from "@/lib/api";

// ====== TYPES ======
interface UserType {
  name?: string;
  email?: string;
  role?: string[];
  permissions?: string[];
}

// ====== PIE DATA ======
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const pieData = [
  { name: "Người dùng", value: 400 },
  { name: "Bài viết", value: 300 },
  { name: "Bình luận", value: 200 },
  { name: "Khác", value: 100 },
];

// ====== LABEL RENDER (đúng chuẩn TS) ======
const renderCustomizedLabel = (props: PieLabelRenderProps) => {
  const { name, percent } = props;

  if (typeof name !== "string") return "";
  if (typeof percent !== "number") return "";

  return `${name} ${(percent * 100).toFixed(0)}%`;
};

export default function DashboardChart() {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(res.data.user);
      } catch (err) {
        console.error("Lỗi lấy thông tin user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="space-y-6">
      {/* Card thông tin user */}
      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
        <h1 className="text-2xl font-semibold mb-4 text-gray-800">
          👋 Xin chào, {user?.name || "Người dùng"}
        </h1>

        {loading ? (
          <p className="text-gray-500">Đang tải thông tin...</p>
        ) : user ? (
          <div className="space-y-2 text-gray-700">
            <p>
              <span className="font-medium">Email:</span> {user.email}
            </p>
            <p>
              <span className="font-medium">Vai trò:</span>{" "}
              {user.role?.join(", ") || "Không có"}
            </p>

            <div>
              <span className="font-medium">Quyền:</span>
              <ul className="list-disc list-inside text-sm mt-1">
                {user.permissions?.length ? (
                  user.permissions.map((p, i) => <li key={i}>{p}</li>)
                ) : (
                  <li>Không có quyền nào</li>
                )}
              </ul>
            </div>
          </div>
        ) : null}
      </div>

      {/* Card thống kê */}
      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          📊 Thống kê tổng quan
        </h2>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={renderCustomizedLabel}
                isAnimationActive
                animationDuration={1200}
              >
                {pieData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
