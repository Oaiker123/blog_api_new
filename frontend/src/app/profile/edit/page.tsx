"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, ArrowLeft, Save, Camera, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-800"
      />
    </div>
  );
}

export default function EditProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [previewCover, setPreviewCover] = useState<string | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const defaultCover = "/image.png";
  const defaultAvatar = "/avt/image.png";

  useEffect(() => {
    api
      .get("/user/profile")
      .then((res) => setProfile(res.data.data))
      .catch(() => toast.error("Không thể tải thông tin người dùng!"))
      .finally(() => setLoading(false));
  }, []);

  // ✅ Hiển thị preview ngay khi chọn file, rồi upload
  const handleSelectFile = async (file: File, field: "avatar" | "cover") => {
    if (!file) return;

    // Tạo preview trước khi upload
    const previewUrl = URL.createObjectURL(file);
    if (field === "avatar") setPreviewAvatar(previewUrl);
    else setPreviewCover(previewUrl);

    await handleUpload(file, field);
  };

  // ✅ Upload ảnh
  const handleUpload = async (file: File, field: "avatar" | "cover") => {
    setUploading(true);
    const toastId = toast.loading("Đang tải ảnh...");

    const formData = new FormData();
    formData.append(field, file);

    try {
      const res = await api.post("/user/profile?_method=PUT", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfile(res.data.data);
      toast.success("Cập nhật ảnh thành công!", { id: toastId });
    } catch {
      toast.error("Không thể tải ảnh. Vui lòng thử lại!", { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async (field: "avatar" | "cover") => {
    const isAvatar = field === "avatar";
    const name = isAvatar ? "ảnh đại diện" : "ảnh bìa";

    toast.info(`Bạn có chắc muốn gỡ ${name}?`, {
      action: {
        label: "Gỡ ảnh",
        onClick: async () => {
          setUploading(true);
          const toastId = toast.loading("Đang gỡ ảnh...");

          try {
            const endpoint = isAvatar ? "/avatar" : "/cover";
            await api.delete(endpoint);
            setProfile((prev: any) => ({
              ...prev,
              [isAvatar ? "avatar_url" : "cover_url"]: null,
            }));
            if (isAvatar) setPreviewAvatar(null);
            else setPreviewCover(null);
            toast.success(`Đã gỡ ${name}!`, { id: toastId });
          } catch {
            toast.error("Không thể gỡ ảnh. Vui lòng thử lại!", { id: toastId });
          } finally {
            setUploading(false);
          }
        },
      },
      duration: 4000,
    });
  };

  const handleSave = async () => {
    setSaving(true);
    const toastId = toast.loading("Đang lưu thay đổi...");

    try {
      await api.put("/user/profile", {
        display_name: profile.display_name,
        username: profile.username,
        bio: profile.bio,
      });
      toast.success("Cập nhật hồ sơ thành công!", { id: toastId });
      router.push("/profile");
    } catch {
      toast.error("Không thể cập nhật. Vui lòng thử lại!", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-gray-500">
        <Loader2 className="animate-spin w-8 h-8 mb-3" />
        <p>Đang tải thông tin...</p>
      </div>
    );
  }

  const coverUrl = previewCover || profile.cover_url || defaultCover;
  const avatarUrl = previewAvatar || profile.avatar_url || defaultAvatar;

  return (
    <div className="min-h-[85vh] bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto mb-6 text-sm text-gray-600 flex items-center gap-2">
        <Link
          href="/profile"
          className="flex items-center gap-1 text-blue-600 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại hồ sơ
        </Link>
      </div>

      <div className="max-w-4xl mx-auto mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">
          Chỉnh sửa hồ sơ
        </h1>
        <p className="text-gray-500 mt-1">
          Cập nhật thông tin cá nhân và ảnh của bạn
        </p>
      </div>

      <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Ảnh bìa */}
        <div className="relative h-48 md:h-56 group overflow-hidden">
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
              e.target.files && handleSelectFile(e.target.files[0], "cover")
            }
          />
        </div>

        {/* Avatar */}
        <div className="relative flex justify-center">
          <div className="absolute -top-16 group/avatar">
            <div className="relative cursor-pointer">
              <img
                src={avatarUrl}
                alt="avatar"
                className={`w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover transition-all duration-300 ${
                  uploading ? "opacity-80 blur-[1px]" : ""
                }`}
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
                        onClick={() => handleRemoveImage("avatar")}
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
                e.target.files && handleSelectFile(e.target.files[0], "avatar")
              }
            />
          </div>
        </div>

        <div className="h-16" />

        {/* Form */}
        <div className="p-8 space-y-5">
          <Input
            label="Tên hiển thị"
            value={profile.display_name || ""}
            onChange={(v) => setProfile({ ...profile, display_name: v })}
          />

          <Input
            label="Tên người dùng (username)"
            value={profile.username || ""}
            onChange={(v) => setProfile({ ...profile, username: v })}
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Giới thiệu bản thân
            </label>
            <textarea
              value={profile.bio || ""}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Mô tả ngắn về bạn..."
              rows={4}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-800 resize-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 transition disabled:opacity-60"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              <Save className="w-4 h-4" />
              Lưu thay đổi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
