"use client";

import { useEffect, useState, useRef } from "react";
import {
  Loader2,
  User,
  Edit,
  Camera,
  Trash2,
  Facebook,
  Linkedin,
  Github,
  Twitter,
  Instagram,
  Youtube,
  Music,
  Globe,
  MapPin,
  Phone,
  Cake,
  Users,
} from "lucide-react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// ✅ THÊM INTERFACE
interface Profile {
  id: number;
  username: string;
  display_name?: string;
  bio?: string;
  location?: string;
  phone?: string;
  birthdate?: string;
  gender?: string;
  website?: string;
  avatar_url?: string;
  cover_url?: string;
  social_links?: string[];
  created_at?: string;
  updated_at?: string;
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "outline" | "danger";
  size?: "sm" | "md";
  className?: string;
}

function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}

function CardContent({ children, className = "" }: CardContentProps) {
  return <div className={`p-8 ${className}`}>{children}</div>;
}

function Button({
  children,
  onClick,
  variant = "default",
  size = "md",
  className = "",
}: ButtonProps) {
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
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

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
      .catch((err: unknown) => console.error(err))
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
    } catch (err: unknown) {
      console.error(err);
      toast.error("Không thể tải ảnh lên. Vui lòng thử lại!");
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
            setProfile((prev: Profile | null) => ({
              ...prev!,
              [isAvatar ? "avatar_url" : "cover_url"]: null,
            }));
            toast.success(`Đã gỡ ${name}!`, { id: toastId });
          } catch (err: unknown) {
            console.error(err);
            toast.error("Không thể gỡ ảnh. Vui lòng thử lại!", { id: toastId });
          } finally {
            setUploading(false);
          }
        },
      },
      duration: 4000,
    });
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-gray-500">
        <Loader2 className="animate-spin w-8 h-8 mb-3 text-blue-500" />
        <p>Đang tải dữ liệu...</p>
      </div>
    );

  if (!profile)
    return (
      <div className="text-center text-gray-500 mt-20">
        Không tìm thấy thông tin người dùng 😢
      </div>
    );

  const coverUrl = profile.cover_url || defaultCover;
  const avatarUrl = profile.avatar_url || defaultAvatar;

  return (
    <div className="min-h-[85vh] bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto mb-6 text-sm text-gray-600">
        <span
          className="hover:text-blue-600 cursor-pointer transition"
          onClick={() => router.push("/")}
        >
          Trang chủ
        </span>{" "}
        / <span className="text-gray-800 font-medium">Hồ sơ cá nhân</span>
      </div>

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

          <CardContent className="pt-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
              {/* CỘT TRÁI */}
              <div className="text-center md:text-left space-y-1">
                <h2 className="text-3xl font-bold text-gray-900">
                  {profile.display_name || "Chưa cập nhật"}
                </h2>
                <p className="text-gray-500 text-base">
                  @{profile.username || "username"}
                </p>
                {profile.bio && (
                  <p className="text-gray-600 italic mt-2 text-sm md:text-base">
                    {profile.bio}
                  </p>
                )}

                {/* Info */}
                <div className="mt-6 flex flex-col gap-3 text-gray-700 text-[15px] leading-relaxed">
                  {profile.location && (
                    <p className="flex items-center gap-2 justify-center md:justify-start">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span>{profile.location}</span>
                    </p>
                  )}
                  {profile.phone && (
                    <p className="flex items-center gap-2 justify-center md:justify-start">
                      <Phone className="w-4 h-4 text-blue-600" />
                      <a href={`tel:${profile.phone}`} className="hover:underline">
                        {profile.phone}
                      </a>
                    </p>
                  )}
                  {profile.birthdate && (
                    <p className="flex items-center gap-2 justify-center md:justify-start">
                      <Cake className="w-4 h-4 text-blue-600" />
                      <span>
                        {new Date(profile.birthdate).toLocaleDateString("vi-VN")}
                      </span>
                    </p>
                  )}
                  {profile.gender && (
                    <p className="flex items-center gap-2 justify-center md:justify-start">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span>
                        {profile.gender === "male"
                          ? "Nam"
                          : profile.gender === "female"
                          ? "Nữ"
                          : "Khác"}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* CỘT PHẢI */}
              <div className="flex flex-col md:items-end items-center">
                <Button
                  onClick={() => router.push("/profile/edit")}
                  className="self-end mb-6"
                >
                  <Edit className="w-4 h-4" /> Chỉnh sửa
                </Button>

                {profile.social_links && profile.social_links.length > 0 && (
                  <div className="w-full">
                    <h3 className="text-gray-800 font-semibold mb-4 flex items-center gap-2 justify-center md:justify-end">
                      <Globe className="w-5 h-5 text-purple-600" />
                      Liên kết mạng xã hội
                    </h3>

                    <div className="flex flex-wrap gap-4 justify-center md:justify-end">
                      {profile.social_links.map((link: string, idx: number) => {
                        let Icon = Globe;
                        let color = "text-gray-600 hover:text-gray-800";
                        if (link.includes("facebook.com")) {
                          Icon = Facebook;
                          color = "text-blue-600 hover:text-blue-700";
                        } else if (link.includes("linkedin.com")) {
                          Icon = Linkedin;
                          color = "text-sky-600 hover:text-sky-700";
                        } else if (link.includes("github.com")) {
                          Icon = Github;
                          color = "text-gray-800 hover:text-black";
                        } else if (
                          link.includes("twitter.com") ||
                          link.includes("x.com")
                        ) {
                          Icon = Twitter;
                          color = "text-sky-500 hover:text-sky-600";
                        } else if (link.includes("instagram.com")) {
                          Icon = Instagram;
                          color = "text-pink-500 hover:text-pink-600";
                        } else if (link.includes("youtube.com")) {
                          Icon = Youtube;
                          color = "text-red-600 hover:text-red-700";
                        } else if (link.includes("tiktok.com")) {
                          Icon = Music;
                          color = "text-black hover:text-gray-700";
                        }

                        return (
                          <a
                            key={idx}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={link}
                            className={`p-3 rounded-full border border-gray-200 hover:shadow-md transition-transform duration-200 hover:scale-110 bg-white ${color}`}
                          >
                            <Icon className="w-6 h-6" />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}