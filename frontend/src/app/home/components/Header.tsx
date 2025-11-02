"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { LogOut, LogIn, Menu, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import Image from "next/image";

const menuItems = [
  { label: "Trang chủ", path: "/home" },
  { label: "Bài viết", path: "/posts" },
  { label: "Người dùng", path: "/users" },
];

export default function Header() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false); // ✅ mới thêm
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // DÒNG CẦN THÊM: State để lưu avatar URL
  const [userProfile, setUserProfile] = useState<{ avatar_url: string } | null>(
    null
  );
  const defaultAvatar = "/avt/image.png"; // Dùng lại default avatar của bạn

  // Function để fetch profile (có thể tái sử dụng từ ProfilePage)
  const fetchUserProfile = () => {
    // Chỉ fetch nếu đã đăng nhập
    if (!localStorage.getItem("token")) return;

    api
      .get("/user/profile")
      .then((res) => {
        setUserProfile(res.data.data);
      })
      .catch((err) => {
        console.error("Error fetching user profile in header:", err);
      });
  };

  useEffect(() => {
    setIsClient(true); // ✅ đánh dấu đã chạy bên client
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    const handleScroll = (() => {
      let lastScroll = 0;
      return () => {
        const currentScroll = window.scrollY;
        setIsScrolled(currentScroll > 10);
        setHidden(currentScroll > lastScroll && currentScroll > 100);
        lastScroll = currentScroll;
      };
    })();

    handleResize();
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    // DÒNG CẦN THÊM: Gọi API để lấy profile
    if (!!token) {
      fetchUserProfile();
    }

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);

    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setIsLoggedIn(false);
      setUserProfile(null); // <== DÒNG CẦN THÊM: Xóa profile
      toast.success("✅ Đăng xuất thành công!");
      router.push("/login");
    } catch (error: any) {
      console.error(error);
      toast.error("❌ Lỗi khi đăng xuất!");
    }
  };

  const handleAuthRedirect = () => router.push("/login");

  // ❗ Chưa mount client thì không render (tránh nhảy layout)
  if (!isClient) return null;

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 backdrop-blur-md border-b transition-all duration-500 ease-in-out transform ${
        hidden ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"
      } ${
        isScrolled
          ? "bg-white/95 shadow-md border-gray-200 py-2"
          : "bg-white/60 shadow-sm border-gray-100 py-3"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 gap-6 transition-all duration-300 relative">
        {/* 🟦 Logo */}
        <div
          onClick={() => router.push("/home")}
          className="text-2xl font-extrabold text-blue-600 cursor-pointer select-none hover:scale-105 transition-transform"
        >
          <Image
            src="/images_logo/logo.png"
            alt="Logo"
            width={50}
            height={30}
            className="object-contain"
          />
        </div>

        {/* 💻 Menu desktop + Search */}
        {!isMobile && (
          <div className="flex-1 flex justify-center items-center gap-8 text-gray-700 font-medium">
            <nav className="flex items-center gap-8">
              {menuItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className="relative group px-3 py-2 transition-all duration-200"
                >
                  <span className="group-hover:text-blue-600">
                    {item.label}
                  </span>
                  <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-blue-600 rounded-full transition-all duration-300 group-hover:w-full"></span>
                </button>
              ))}
            </nav>

            {/* 🔍 Ô tìm kiếm */}
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="w-full py-2.5 pl-4 pr-10 border border-gray-200 rounded-full bg-white shadow-sm
               focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400
               focus:shadow-lg transition-all duration-200 ease-in-out text-gray-700 placeholder-gray-400"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.2-5.2m1.7-4.3a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        )}

        {/* Desktop: avatar hoặc đăng nhập */}
        {!isMobile && (
          <div className="flex justify-end items-center relative">
            {isLoggedIn ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 focus:outline-none group"
                >
                  <img
                    // DÒNG CẦN CHỈNH SỬA
                    src={userProfile?.avatar_url || defaultAvatar}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full border-2 border-blue-100 group-hover:border-blue-400 transition-all duration-200"
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`w-4 h-4 text-gray-600 transition-transform duration-300 ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown nằm dưới avatar */}
                <div
                  className={`absolute right-0 top-full mt-3 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-200 origin-top ${
                    dropdownOpen
                      ? "opacity-100 scale-100 translate-y-0"
                      : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                  }`}
                >
                  <div className="absolute right-4 -top-2 w-3 h-3 bg-white border-l border-t border-gray-100 rotate-45"></div>

                  <div className="relative z-10">
                    <button
                      onClick={() => {
                        router.push("/profile");
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      Hồ sơ cá nhân
                    </button>
                    <button
                      onClick={() => {
                        handleLogout();
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      Đăng xuất
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => router.push("/login")}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-sm transition-all"
              >
                Sign In
              </button>
            )}
          </div>
        )}

        {/* 📱 Toggle mobile menu */}
        {isMobile && (
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center justify-center text-gray-700 hover:text-blue-600 transition"
            aria-label={menuOpen ? "Đóng menu" : "Mở menu"}
          >
            {menuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        )}
      </div>

      {/* 📱 Menu mobile */}
      {isMobile && (
        <nav
          className={`absolute left-0 w-full bg-white shadow-lg border-t border-gray-100 rounded-b-2xl z-40 overflow-hidden transform transition-all duration-300 ease-out ${
            menuOpen
              ? "opacity-100 translate-y-0 max-h-[400px]"
              : "opacity-0 -translate-y-4 max-h-0 pointer-events-none"
          }`}
        >
          <div className="flex flex-col py-4 space-y-1 px-5">
            {/* 🔍 Ô tìm kiếm trên mobile */}
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="w-full py-2.5 pl-4 pr-10 border border-gray-200 rounded-full bg-white shadow-sm
               focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400
               focus:shadow-lg transition-all duration-200 ease-in-out text-gray-700 placeholder-gray-400"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.2-5.2m1.7-4.3a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  router.push(item.path);
                  setMenuOpen(false);
                }}
                className="text-gray-700 font-medium text-left hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-all duration-200"
              >
                {item.label}
              </button>
            ))}

            <div className="border-t border-gray-200 my-3"></div>

            {isLoggedIn ? (
              <button
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white w-full px-4 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
              >
                <LogOut size={18} /> <span>Đăng xuất</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  handleAuthRedirect();
                  setMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white w-full px-4 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
              >
                <LogIn size={18} /> <span>Sign In</span>
              </button>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
