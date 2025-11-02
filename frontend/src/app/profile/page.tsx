"use client";

import { useEffect, useState, useRef } from "react";
import { Loader2, User, Edit, LogOut, Camera, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation"; // <== DÒNG CẦN THÊM

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}

function CardContent({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`p-8 ${className}`}>{children}</div>;
}

function Button({
  children,
  onClick,
  variant = "default",
  size = "md",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "outline" | "danger";
  size?: "sm" | "md";
}) {
  const base =
    "rounded-xl font-medium transition flex items-center justify-center gap-2 focus:ring-2 focus:ring-offset-1";
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-400",
    outline:
      "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-300",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-400",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
  };
  return (
    <button
      onClick={onClick}
      className={`${base} ${variants[variant]} ${sizes[size]}`}
    >
      {children}
    </button>
  );
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter(); // <== DÒNG CẦN THÊM

  const defaultCover = "/image.png";
  const defaultAvatar = "/avt/image.png";

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = () => {
    setLoading(true);
    api
      .get("/user/profile")
      .then((res) => setProfile(res.data.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleUpload = async (file: File, field: "avatar" | "cover") => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append(field, file);

    try {
      const res = await api.post("/user/profile?_method=PUT", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfile(res.data.data);
    } catch (err) {
      console.error(err);
      alert("Không thể tải ảnh lên. Vui lòng thử lại!");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async (field: "avatar" | "cover") => {
    if (!confirm("Bạn có chắc muốn gỡ ảnh này không?")) return;
    setUploading(true);
    try {
      const res = await api.put("/user/profile", { [`remove_${field}`]: true });
      setProfile(res.data.data);
    } catch (err) {
      console.error(err);
      alert("Không thể gỡ ảnh. Vui lòng thử lại!");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-gray-500">
        <Loader2 className="animate-spin w-8 h-8 mb-3 text-blue-500" />
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center text-gray-500 mt-20">
        Không tìm thấy thông tin người dùng 😢
      </div>
    );
  }

  const coverUrl = profile.cover_url || defaultCover;
  const avatarUrl = profile.avatar_url || defaultAvatar;

  // Khoảng dòng 143
  return (
    <div className="min-h-[85vh] bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto mb-6 text-sm text-gray-600">
        <span
          className="hover:text-blue-600 cursor-pointer transition"
          onClick={() => router.push("/")} // <== ĐÃ CHỈNH SỬA Ở ĐÂY
        >
          Trang chủ
        </span>{" "}
        / <span className="text-gray-800 font-medium">Hồ sơ cá nhân</span> {" "}
      </div>

      {/* Tiêu đề */}
      <div className="max-w-4xl mx-auto mb-6">
        <h1 className="text-3xl font-semibold text-gray-800 flex items-center gap-2">
          <User className="w-7 h-7 text-blue-600" />
          Hồ sơ cá nhân
        </h1>
        <p className="text-gray-500 mt-1">
          Thông tin chi tiết tài khoản của bạn
        </p>
      </div>
      <div className="max-w-4xl mx-auto">
        <Card>
          {/* Ảnh bìa */}
          <div className="relative h-48 md:h-56 group">
            <img
              src={coverUrl}
              alt="cover"
              className="w-full h-full object-cover group-hover:brightness-95 transition"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/30 transition">
              {uploading ? (
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              ) : (
                <div className="flex gap-4">
                  <button
                    onClick={() => coverInputRef.current?.click()}
                    className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition"
                    title="Thay ảnh bìa"
                  >
                    <Camera className="w-5 h-5 text-white" />
                  </button>
                  {profile.cover_url && (
                    <button
                      onClick={() => handleRemoveImage("cover")}
                      className="p-2 bg-white/20 rounded-full hover:bg-red-500/80 transition"
                      title="Gỡ ảnh bìa"
                    >
                      <Trash2 className="w-5 h-5 text-white" />
                    </button>
                  )}
                </div>
              )}
            </div>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                e.target.files && handleUpload(e.target.files[0], "cover")
              }
            />

            {/* Avatar */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 group/avatar">
              <div
                className="relative cursor-pointer"
                onClick={() => avatarInputRef.current?.click()}
              >
                <img
                  src={avatarUrl}
                  alt=""
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg transition-transform duration-300 group-hover/avatar:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center gap-4 transition">
                  {uploading ? (
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  ) : (
                    <>
                      <Camera
                        className="w-5 h-5 text-white cursor-pointer"
                        onClick={() => avatarInputRef.current?.click()}
                      />
                      {avatarUrl !== defaultAvatar && (
                        <Trash2
                          className="w-5 h-5 text-white hover:text-red-300 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage("avatar");
                          }}
                        />
                      )}
                    </>
                  )}
                </div>
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  e.target.files && handleUpload(e.target.files[0], "avatar")
                }
              />
            </div>
          </div>

          {/* Nội dung */}
          <CardContent className="pt-20 text-center md:text-left">
            <h2 className="text-2xl font-semibold text-gray-800">
              {profile.display_name || "Chưa cập nhật"}
            </h2>
            <p className="text-gray-500">@{profile.username || "username"}</p>
            <p className="text-gray-600 mt-2">
              {profile.bio || "Chưa có mô tả bản thân."}
            </p>

            <div className="mt-5 flex justify-center md:justify-start gap-3">
              <Button onClick={() => alert("Tính năng chỉnh sửa sắp ra mắt!")}>
                <Edit className="w-4 h-4" /> Chỉnh sửa
              </Button>
              <Button variant="outline" onClick={() => alert("Đăng xuất!")}>
                <LogOut className="w-4 h-4" /> Đăng xuất
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
