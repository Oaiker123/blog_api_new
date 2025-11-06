"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Loader2, ArrowLeft, Trash2, Edit, Eye, X } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function PostDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // 🟢 Lấy user hiện tại + bài viết
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, postRes] = await Promise.all([
          api.get("/me"),
          api.get(`/posts/${id}`),
        ]);

        setUser(userRes.data);
        setPost(postRes.data.post || postRes.data);
      } catch {
        toast.error("Không thể tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  // ✅ Hàm kiểm tra quyền
  const hasPermission = (perm: string) => {
    return user?.permissions?.includes(perm);
  };

  // ✅ Hàm xóa bài
  const handleDelete = async () => {
    try {
      await api.delete(`/posts/${id}`);
      toast.success("🗑️ Đã xóa bài viết!");
      router.push("/admin/posts");
    } catch {
      toast.error("Lỗi khi xóa bài viết");
    }
  };

  // ✅ Xác nhận xóa bằng toast.custom
  const confirmDelete = () => {
    toast.custom((t: any) => (
      <div className="bg-white border rounded-lg p-4 shadow-lg space-y-3">
        <p className="font-semibold text-red-600">
          Xóa bài viết này?
        </p>
        <p className="text-sm text-gray-500">
          Hành động này không thể hoàn tác.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 text-sm rounded-md border hover:bg-gray-100"
          >
            Hủy
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              handleDelete();
            }}
            className="px-3 py-1 text-sm rounded-md bg-red-600 text-white hover:bg-red-700"
          >
            Xóa
          </button>
        </div>
      </div>
    ));
  };

  // ✅ Chuẩn hóa đường dẫn ảnh
  const getImageUrl = (path: string) => {
    if (!path) return "";
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    if (path.startsWith("http")) return path;
    if (path.startsWith("storage/")) return `${base}/${path}`;
    return `${base}/storage/${path}`;
  };

  const getGalleryImages = () => {
    if (!post?.media?.length) return [];
    return post.media
      .filter((m: any) => m.type === "image")
      .map((m: any, i: number) => ({
        url: getImageUrl(m.url),
        name: m.name || `Ảnh ${i + 1}`,
      }));
  };

  const openImagePreview = (url: string, index: number) => {
    setPreviewImage(url);
    setCurrentImageIndex(index);
  };

  const navigateImage = (direction: "prev" | "next") => {
    const images = getGalleryImages();
    if (images.length === 0) return;
    let newIndex =
      direction === "next"
        ? (currentImageIndex + 1) % images.length
        : (currentImageIndex - 1 + images.length) % images.length;
    setCurrentImageIndex(newIndex);
    setPreviewImage(images[newIndex].url);
  };

  if (loading)
    return (
      <div className="flex justify-center mt-10">
        <Loader2 className="animate-spin text-gray-500" />
      </div>
    );

  if (!post)
    return (
      <div className="text-center mt-10 text-gray-500">
        ❌ Không tìm thấy bài viết
      </div>
    );

  const galleryImages = getGalleryImages() || [];

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Quay lại
          </button>
        </div>

        <div className="flex gap-3">
          {hasPermission("edit posts") && (
            <Link
              href={`/admin/posts/${id}/edit`}
              className="text-blue-600 hover:text-blue-800"
              title="Chỉnh sửa"
            >
              <Edit />
            </Link>
          )}

          {hasPermission("delete posts") && (
            <button
              onClick={confirmDelete}
              className="text-red-600 hover:text-red-800"
              title="Xóa"
            >
              <Trash2 />
            </button>
          )}
        </div>
      </div>

      <h1 className="text-2xl font-bold ml-3 mb-4">{post.title}</h1>

      {/* Ảnh đại diện */}
      {post.thumbnail && (
        <div className="mb-6 text-center">
          <img
            src={getImageUrl(post.thumbnail)}
            alt={post.title}
            className="mx-auto w-auto max-w-[300px] h-auto max-h-[300px] rounded-lg border object-contain cursor-pointer"
            onClick={() => setPreviewImage(getImageUrl(post.thumbnail))}
          />
          <p className="text-sm text-gray-500 mt-2">Ảnh đại diện</p>
        </div>
      )}

      {/* Gallery ảnh */}
      {Array.isArray(galleryImages) && galleryImages.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Gallery ảnh ({galleryImages.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {galleryImages.map((img, index) => (
              <div
                key={index}
                className="relative group cursor-pointer bg-gray-100 rounded-lg overflow-hidden border hover:shadow"
                onClick={() => openImagePreview(img.url, index)}
              >
                <img
                  src={img.url}
                  alt={img.name}
                  className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                  <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nội dung */}
      <p className="text-gray-700 mb-4">{post.excerpt}</p>
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Thông tin thêm */}
      <div className="border-t mt-6 pt-4 text-sm text-gray-500 space-y-1">
        <p>
          📅 Ngày đăng: {new Date(post.created_at).toLocaleDateString("vi-VN")}
        </p>
        <p>
          🧑 Tác giả:{" "}
          <span className="font-medium">{post.user?.name || "Không rõ"}</span>
        </p>
        <p>
          🏷️ Danh mục:{" "}
          <span className="font-medium">
            {post.category?.name || "Chưa có"}
          </span>
        </p>
        {post.tags?.length > 0 && (
          <p>
            🔖 Tags:{" "}
            {post.tags.map((t: any) => (
              <span
                key={t.id}
                className="inline-block bg-gray-100 border px-2 py-1 rounded-md mr-1"
              >
                {t.name}
              </span>
            ))}
          </p>
        )}
        <p>
          ⚙️ Trạng thái:{" "}
          <span
            className={`font-medium ${
              post.status === "approved"
                ? "text-green-600"
                : post.status === "pending"
                ? "text-yellow-600"
                : "text-gray-600"
            }`}
          >
            {post.status}
          </span>
        </p>
      </div>

      {/* Modal xem ảnh lớn */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[85vh] w-full">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white text-sm">
                Ảnh {currentImageIndex + 1} / {galleryImages.length}
              </span>
              <button
                onClick={() => setPreviewImage(null)}
                className="text-white hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <img
              src={previewImage}
              alt={`Ảnh ${currentImageIndex + 1}`}
              className="max-w-full max-h-[80vh] object-contain mx-auto rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
