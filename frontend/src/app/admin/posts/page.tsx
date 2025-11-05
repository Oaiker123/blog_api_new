"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Loader2, CheckCircle, Edit, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/posts")
      .then((res) => {
        setPosts(res.data.posts);
      })
      .catch(() => toast.error("Lỗi tải danh sách bài viết"))
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async (id: number) => {
    try {
      await api.put(`/posts/${id}/approve`);
      toast.success("Đã duyệt bài viết!");
      setPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: "approved" } : p))
      );
    } catch {
      toast.error("Lỗi khi duyệt bài viết");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa bài viết này?")) return;
    try {
      await api.delete(`/posts/${id}`);
      toast.success("Đã xóa bài viết");
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      toast.error("Lỗi khi xóa bài viết");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center mt-10">
        <Loader2 className="animate-spin text-gray-500" />
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">📋 Quản lý bài viết</h1>
        <Link
          href="/admin/posts/create"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          ➕ Create
        </Link>
      </div>

      <div className="space-y-4">
        {posts.length === 0 && (
          <p className="text-gray-500 text-center">Chưa có bài viết nào.</p>
        )}

        {posts.map((post) => (
          <div
            key={post.id}
            className="flex justify-between items-start bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition"
          >
            <div className="flex-1">
              <h2 className="font-semibold text-lg">{post.title}</h2>
              <p className="text-gray-600 line-clamp-2">{post.content}</p>
              <div className="text-sm text-gray-500 mt-2">
                🧑 {post.user?.name} — Trạng thái:{" "}
                <span
                  className={
                    post.status === "approved"
                      ? "text-green-600 font-medium"
                      : "text-yellow-600 font-medium"
                  }
                >
                  {post.status}
                </span>
              </div>
            </div>

            <div className="flex gap-3 ml-4">
              {post.status !== "approved" && (
                <button
                  onClick={() => handleApprove(post.id)}
                  className="text-green-600 hover:text-green-800"
                  title="Duyệt bài"
                >
                  <CheckCircle />
                </button>
              )}
              <Link href={`/admin/posts/${post.id}`} title="Xem chi tiết">
                <Eye className="text-blue-600 hover:text-blue-800" />
              </Link>
              <button
                onClick={() => handleDelete(post.id)}
                className="text-red-500 hover:text-red-700"
                title="Xóa bài"
              >
                <Trash2 />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
