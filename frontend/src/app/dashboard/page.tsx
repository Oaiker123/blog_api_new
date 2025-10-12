"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [protectedData, setProtectedData] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (!token) {
      router.push("/login");
      return;
    }
    if (userStr) setUser(JSON.parse(userStr));

    // Ví dụ gọi API protected:
    api
      .get("/user") // hoặc endpoint protected bạn có (vd: /auth/me)
      .then((res) => setProtectedData(res.data))
      .catch((err) => {
        console.error("Protected API error:", err);
      });
  }, []);

  if (!user) return <p>Đang tải...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Xin chào, {user.name}</h2>
      <p>Email: {user.email}</p>

      <div style={{ marginTop: 12 }}>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            router.push("/login");
          }}
        >
          Đăng xuất
        </button>
      </div>

      <div style={{ marginTop: 20 }}>
        <h3>Protected data from API:</h3>
        <pre>{JSON.stringify(protectedData, null, 2)}</pre>
      </div>
    </div>
  );
}
