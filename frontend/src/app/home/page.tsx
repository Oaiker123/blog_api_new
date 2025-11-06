"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Header from "./components/Header";
import { useRouter } from "next/navigation";

interface UserInfo {
  id: number;
  name: string;
  email: string;
  role: string[];
  permissions: string[];
}

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const [posts, setPosts] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    api
      .get("/posts")
      .then((res) => setPosts(res.data.posts || res.data))
      .catch((err) => console.error("Không thể tải bài viết:", err));
  }, []);

  // ✅ Thêm đoạn này: Cập nhật user mới nhất khi reload trang
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    api
      .get("/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        localStorage.setItem("user", JSON.stringify(res.data.user));
      })
      .catch((err) => {
        console.error("Không thể load user:", err);
      });
  }, []);

  // 🎢 Theo dõi vị trí cuộn để tạo hiệu ứng parallax
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 🔹 Gọi API lấy thông tin user hiện tại
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUserInfo(res.data.user);
      } catch (err) {
        console.error("Không thể lấy thông tin user:", err);
      }
    };

    fetchUserInfo();
  }, []);

  // ⏳ Hiệu ứng loading
  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), 200);
    const doneTimer = setTimeout(() => setLoading(false), 600);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  if (loading) {
    return (
      <div
        className={`fixed inset-0 flex flex-col items-center justify-center bg-white z-[9999] transition-opacity duration-700 ${
          fadeOut ? "opacity-0" : "opacity-100"
        }`}
      >
        {/* 🔹 Logo xoay */}
        <div className="relative w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xl font-bold text-blue-600">MyApp</span>
        </div>
        <p className="mt-4 text-gray-500 text-sm animate-pulse">
          Đang tải nội dung...
        </p>
      </div>
    );
  }

  function getImageUrl(path: string) {
    if (!path) return "";
    if (path.startsWith("http")) return path; // nếu đã là URL đầy đủ
    return `${
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    }/storage/${path}`;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 animate-fadeIn">
      {/* 🔹 Header */}
      <Header />
      {/* 🔹 Hero Section có parallax */}
      <section
        className="relative flex flex-col items-center justify-center text-center min-h-[90vh] overflow-hidden bg-gradient-to-b from-blue-100 via-white to-gray-50"
        style={{
          transform: `translateY(${scrollY * 0.2}px)`,
          transition: "transform 0.1s linear",
        }}
      >
        <div className="absolute inset-0 bg-[url('/hero-bg.jpg')] bg-cover bg-center opacity-10" />
        <div
          className="relative z-10 transition-all duration-500"
          style={{
            transform: `translateY(${scrollY * 0.1}px)`,
            opacity: Math.max(1 - scrollY / 400, 0.2),
          }}
        >
          <h1 className="text-5xl font-extrabold text-gray-800 mb-4 drop-shadow-sm">
            🎉 Chào mừng đến với <span className="text-blue-600">MyApp</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8 text-lg">
            Trải nghiệm ứng dụng hiện đại, mượt mà và dễ sử dụng.
          </p>
          <button
            onClick={() => console.log("Đi đến bài viết...")}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:bg-blue-700 transition-all active:scale-95"
          >
            🚀 Bắt đầu ngay
          </button>
        </div>
      </section>
      {/* 🔹 Section tính năng */}
      <section className="py-24 bg-white text-center">
        <h2 className="text-3xl font-semibold mb-10 text-gray-800">
          ✨ Tính năng nổi bật
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-6">
          {["Giao diện đẹp", "Bảo mật cao", "Hiệu năng tốt"].map(
            (feature, i) => (
              <div
                key={i}
                className="p-8 rounded-2xl shadow-sm border border-gray-100 bg-gray-50 hover:shadow-md transition-all hover:-translate-y-1"
              >
                <h3 className="text-lg font-semibold mb-2 text-blue-600">
                  {feature}
                </h3>
                <p className="text-gray-600">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Quisque facilisis et nulla at ultricies.
                </p>
              </div>
            )
          )}
        </div>
      </section>
      {/* 🔹 Section giới thiệu */}
      <section className="py-24 bg-gray-100 text-center">
        <h2 className="text-3xl font-semibold mb-6 text-gray-800">
          🚀 Giới thiệu thêm
        </h2>
        <p className="max-w-3xl mx-auto text-gray-600 mb-10">
          Đây là nội dung để bạn thử hiệu ứng cuộn, header sticky, và các thành
          phần giao diện động.
        </p>

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6 px-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition hover:-translate-y-1"
            >
              <h3 className="font-semibold text-blue-600 mb-2">
                Mục nội dung {i}
              </h3>
              <p className="text-gray-600">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Ullam,
                voluptas.
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 bg-white text-center">
        <h2 className="text-3xl font-semibold mb-10 text-gray-800">
          📰 Bài viết mới nhất
        </h2>

        {posts.length === 0 ? (
          <p className="text-gray-500">Chưa có bài viết nào.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-6">
            {posts.map((post) => (
              <div
                key={post.id}
                onClick={() => router.push(`/posts/${post.id}`)}
                className="cursor-pointer bg-gray-50 border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all p-6"
              >
                {post.thumbnail && (
                  <img
                    src={getImageUrl(post.thumbnail)}
                    alt={post.title}
                    className="rounded-xl w-full h-48 object-cover mb-4"
                  />
                )}

                <h3 className="text-xl font-semibold text-blue-600 mb-2">
                  {post.title}
                </h3>
                <div
                  className="text-gray-600 text-sm line-clamp-3"
                  dangerouslySetInnerHTML={{ __html: post.excerpt }}
                ></div>
              </div>
            ))}
          </div>
        )}
      </section>
      {/* 🔹 Footer */}
      <footer className="bg-gray-900 text-gray-400 py-6 text-center text-sm">
        © 2025 MyApp. All rights reserved.
        {/* 🔹 Hiển thị thông tin user */}
        {userInfo && (
          <section className="p-6 m-6 bg-white rounded-2xl shadow-md border border-gray-100">
            <h2 className="text-2xl font-semibold text-blue-600 mb-4">
              👤 Thông tin tài khoản
            </h2>
            <p className="text-gray-700">
              <strong>Tên:</strong> {userInfo.name}
            </p>
            <p className="text-gray-700">
              <strong>Email:</strong> {userInfo.email}
            </p>
            <p className="text-gray-700">
              <strong>Role:</strong>{" "}
              {userInfo.role.length > 0 ? userInfo.role.join(", ") : "Không có"}
            </p>
            <p className="text-gray-700">
              <strong>Quyền:</strong>{" "}
              {userInfo.permissions.length > 0
                ? userInfo.permissions.join(", ")
                : "Không có"}
            </p>
          </section>
        )}
      </footer>
    </div>
  );
}
