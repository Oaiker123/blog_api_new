"use client";

import { useEffect, useRef, useState } from "react";
import {
  Loader2,
  ArrowLeft,
  Save,
  Camera,
  Trash2,
  Facebook,
  Globe,
  Linkedin,
  Github,
  Twitter,
  Youtube,
  Instagram,
  Music,
} from "lucide-react";
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

  // ✅ Lấy dữ liệu hồ sơ
  useEffect(() => {
    api
      .get("/user/profile")
      .then((res) => {
        const data = res.data.data;

        // 🔹 Xử lý social_links: JSON string, array hoặc object đều được
        const raw = data.social_links;
        let social: any[] = [];
        try {
          social =
            typeof raw === "string"
              ? JSON.parse(raw)
              : Array.isArray(raw)
              ? raw
              : Object.values(raw || {});
        } catch {
          social = [];
        }

        // 🔹 Chuẩn hóa ngày sinh
        let formattedDate = "";
        if (data.birthdate) {
          if (data.birthdate.includes("/")) {
            const [day, month, year] = data.birthdate.split("/");
            formattedDate = `${year}-${month.padStart(2, "0")}-${day.padStart(
              2,
              "0"
            )}`;
          } else if (data.birthdate.includes("-")) {
            formattedDate = data.birthdate.split("T")[0];
          }
        }

        setProfile({
          ...data,
          birthdate: formattedDate,
          social_links: social,
          newSocialLink: "",
        });
      })
      .catch(() => toast.error("Không thể tải thông tin người dùng!"))
      .finally(() => setLoading(false));
  }, []);

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

  const handleSelectFile = async (file: File, field: "avatar" | "cover") => {
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    if (field === "avatar") setPreviewAvatar(previewUrl);
    else setPreviewCover(previewUrl);
    await handleUpload(file, field);
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
        location: profile.location,
        birthdate: profile.birthdate,
        gender: profile.gender,
        phone: profile.phone,
        website: profile.website,
        social_links: JSON.stringify(profile.social_links || []),
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

          {/* 🏠 Thông tin phụ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <Input
              label="Địa điểm"
              value={profile.location || ""}
              onChange={(v) => setProfile({ ...profile, location: v })}
              placeholder="VD: Hà Nội, Việt Nam"
            />

            <Input
              label="Số điện thoại"
              value={profile.phone || ""}
              onChange={(v) => setProfile({ ...profile, phone: v })}
              placeholder="VD: 0901234567"
              type="tel"
            />

            <Input
              label="Ngày sinh"
              value={profile.birthdate || ""}
              onChange={(v) => setProfile({ ...profile, birthdate: v })}
              type="date"
            />

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Giới tính
              </label>
              <select
                value={profile.gender || ""}
                onChange={(e) =>
                  setProfile({ ...profile, gender: e.target.value })
                }
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-800"
              >
                <option value="">Chọn giới tính</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>

            <Input
              label="Website cá nhân"
              value={profile.website || ""}
              onChange={(v) => setProfile({ ...profile, website: v })}
              placeholder="https://example.com"
              type="url"
            />
          </div>

          {/* 🌐 Liên kết mạng xã hội */}
          <div className="flex flex-col gap-2 pt-2">
            <label className="text-sm font-medium text-gray-700">
              Liên kết mạng xã hội
            </label>

            <div className="space-y-2">
              {(Array.isArray(profile.social_links)
                ? profile.social_links
                : []
              ).map((item: any, index: number) => {
                const link = typeof item === "string" ? item : item.url || "";

                let Icon = Globe;
                let color = "text-gray-600";

                if (link.includes("facebook.com")) {
                  Icon = Facebook;
                  color = "text-blue-600";
                } else if (link.includes("linkedin.com")) {
                  Icon = Linkedin;
                  color = "text-sky-700";
                } else if (link.includes("github.com")) {
                  Icon = Github;
                  color = "text-gray-800";
                } else if (
                  link.includes("twitter.com") ||
                  link.includes("x.com")
                ) {
                  Icon = Twitter;
                  color = "text-sky-500";
                } else if (link.includes("instagram.com")) {
                  Icon = Instagram;
                  color = "text-pink-500";
                } else if (link.includes("youtube.com")) {
                  Icon = Youtube;
                  color = "text-red-600";
                } else if (link.includes("tiktok.com")) {
                  Icon = Music;
                  color = "text-black";
                }

                return (
                  <div key={index} className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${color}`} />
                    <input
                      type="url"
                      value={link}
                      onChange={(e) => {
                        const newLinks = [...profile.social_links];
                        newLinks[index] = e.target.value;
                        setProfile({ ...profile, social_links: newLinks });
                      }}
                      placeholder="Dán liên kết mạng xã hội..."
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-800"
                    />
                    <button
                      onClick={() => {
                        const newLinks = [...profile.social_links];
                        newLinks.splice(index, 1);
                        setProfile({ ...profile, social_links: newLinks });
                      }}
                      className="p-2 hover:bg-red-50 rounded-full transition"
                      title="Xóa liên kết này"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                );
              })}

              {/* Ô thêm mới */}
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-400" />
                <input
                  type="url"
                  placeholder="Thêm liên kết mới (Facebook, LinkedIn, v.v...)"
                  value={profile.newSocialLink || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, newSocialLink: e.target.value })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && profile.newSocialLink.trim() !== "") {
                      e.preventDefault();
                      const newLinks = [
                        ...(Array.isArray(profile.social_links)
                          ? profile.social_links
                          : []),
                        profile.newSocialLink.trim(),
                      ];
                      setProfile({
                        ...profile,
                        social_links: newLinks,
                        newSocialLink: "",
                      });
                    }
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-800"
                />
                <button
                  onClick={() => {
                    if (!profile.newSocialLink.trim()) return;
                    const newLinks = [
                      ...(Array.isArray(profile.social_links)
                        ? profile.social_links
                        : []),
                      profile.newSocialLink.trim(),
                    ];
                    setProfile({
                      ...profile,
                      social_links: newLinks,
                      newSocialLink: "",
                    });
                  }}
                  className="p-2 bg-blue-100 hover:bg-blue-200 rounded-full transition"
                  title="Thêm liên kết"
                >
                  <Save className="w-4 h-4 text-blue-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Nút lưu */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Lưu thay đổi
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
