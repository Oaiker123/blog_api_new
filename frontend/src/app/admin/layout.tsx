"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import {
  Bell,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [userName, setUserName] = useState("Admin");

  const [showNoti, setShowNoti] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notiRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // 🧩 Fake data
  const fakeNotifications = [
    { id: 1, text: "Người dùng mới vừa đăng ký tài khoản." },
    { id: 2, text: "Một bài viết đang chờ duyệt." },
    { id: 3, text: "Bình luận mới trên bài viết #25." },
  ];

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.name) setUserName(user.name);

    const handleClickOutside = (e: MouseEvent) => {
      if (
        !notiRef.current?.contains(e.target as Node) &&
        !userMenuRef.current?.contains(e.target as Node)
      ) {
        setShowNoti(false);
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const roles = user.roles || [];
    if (!roles.includes("Super Admin") && !roles.includes("Moderator")) {
      router.replace("/home");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.replace("/login");
  };

  return (
    <div
      className={`flex min-h-screen transition-colors duration-300 ${
        theme === "light" ? "bg-gray-100" : "bg-gray-900 text-gray-100"
      }`}
    >
      {/* Sidebar (with smooth slide-in animation) */}
      <AnimatePresence>
        {isSidebarOpen && !isDesktop && (
          <>
            <motion.div
              initial={{ x: -250 }}
              animate={{ x: 0 }}
              exit={{ x: -250 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 shadow-xl"
            >
              <Sidebar
                isCollapsed={false}
                isOpen={true}
                onClose={() => setIsSidebarOpen(false)}
                isDesktop={false}
              />
            </motion.div>

            {/* Overlay khi mở sidebar trên mobile */}
            <motion.div
              className="fixed inset-0 bg-black/40 z-30 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
            />
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      {isDesktop && (
        <Sidebar
          isCollapsed={isCollapsed}
          isOpen={true}
          onClose={() => {}}
          isDesktop={true}
        />
      )}

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isDesktop
            ? isCollapsed
              ? "lg:ml-[80px]"
              : "lg:ml-[260px]"
            : "lg:ml-0"
        }`}
      >
        {/* Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className={`flex items-center justify-between px-5 py-3 mb-6 sticky top-0 z-30 rounded-b-2xl shadow-sm backdrop-blur-md bg-white/60 dark:bg-gray-800/50 border-b ${
            theme === "light"
              ? "border-gray-200 text-gray-800"
              : "border-gray-700"
          }`}
        >
          {/* Mobile toggle */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Menu size={22} />
          </button>

          {/* Collapse desktop */}
          <button
            onClick={() => setIsCollapsed((s) => !s)}
            className="hidden lg:inline-flex items-center justify-center bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition"
          >
            {isCollapsed ? <Menu size={20} /> : <X size={20} />}
          </button>

          {/* Search */}
          <div className="relative w-full max-w-sm">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className={`w-full rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                theme === "light"
                  ? "bg-gray-50 border border-gray-300 text-gray-800"
                  : "bg-gray-700 border border-gray-600 text-gray-100"
              }`}
            />
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 relative">
            {/* Notification */}
            <div ref={notiRef} className="relative">
              <button
                onClick={() => {
                  setShowNoti(!showNoti);
                  setShowUserMenu(false);
                }}
                className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-gray-700 transition relative"
              >
                <Bell size={20} />
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] px-[4px] rounded-full">
                  3
                </span>
              </button>

              <AnimatePresence>
                {showNoti && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className={`absolute right-0 mt-2 w-64 rounded-xl shadow-lg border overflow-hidden ${
                      theme === "light"
                        ? "bg-white border-gray-200"
                        : "bg-gray-800 border-gray-700"
                    }`}
                  >
                    <div className="p-3 font-semibold border-b border-gray-200 dark:border-gray-700">
                      Thông báo
                    </div>
                    <ul className="max-h-60 overflow-auto">
                      {fakeNotifications.map((n) => (
                        <li
                          key={n.id}
                          className="px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer transition"
                        >
                          {n.text}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-gray-700 transition"
            >
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {/* User menu */}
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowNoti(false);
                }}
                className="flex items-center gap-2 border-l border-gray-300 dark:border-gray-700 pl-4"
              >
                <img
                  src="https://i.pravatar.cc/40"
                  alt="avatar"
                  className="w-9 h-9 rounded-full border border-gray-300 dark:border-gray-600"
                />
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold">{userName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Quản trị viên
                  </p>
                </div>
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className={`absolute right-0 mt-2 w-48 rounded-xl shadow-lg border overflow-hidden ${
                      theme === "light"
                        ? "bg-white border-gray-200"
                        : "bg-gray-800 border-gray-700"
                    }`}
                  >
                    <ul className="py-1">
                      <li className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer transition">
                        <User size={16} /> Trang cá nhân
                      </li>
                      <li className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer transition">
                        <Settings size={16} /> Cài đặt
                      </li>
                      <li
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700 cursor-pointer transition"
                      >
                        <LogOut size={16} /> Đăng xuất
                      </li>
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.header>

        {/* Main */}
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
