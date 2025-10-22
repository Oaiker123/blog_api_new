"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Newspaper, LayoutDashboard, LogOut } from "lucide-react";

export default function Sidebar({
  isCollapsed,
  isOpen,
  onClose,
  isDesktop,
}: {
  isCollapsed: boolean;
  isOpen: boolean;
  onClose: () => void;
  isDesktop: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<string>("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const roles = user.roles || [];
    setRole(roles[0]);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const navItem = (
    icon: React.ReactNode,
    label: string,
    path: string
  ) => {
    const active = pathname === path;

    return (
      <button
        onClick={() => {
          router.push(path);
          onClose();
        }}
        className={`
          group flex items-center gap-3 text-left p-2 rounded-xl transition-all
          ${active
            ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md"
            : "hover:bg-white/10 hover:shadow-sm text-gray-100"
          }
        `}
      >
        <div
          className={`w-6 h-6 flex items-center justify-center transition-transform ${
            active ? "scale-110" : "group-hover:scale-105"
          }`}
        >
          {icon}
        </div>
        {!isCollapsed && (
          <span className="truncate font-medium tracking-wide">
            {label}
          </span>
        )}
      </button>
    );
  };

  const computedX = isDesktop ? 0 : isOpen ? 0 : -280;
  const computedWidth = isCollapsed ? 80 : 260;

  return (
    <>
      {/* Overlay cho mobile */}
      <AnimatePresence>
        {isOpen && !isDesktop && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280, opacity: 0 }}
        animate={{
          x: computedX,
          width: computedWidth,
          opacity: 1,
          transition: {
            type: "spring",
            stiffness: 120,
            damping: 16,
          },
        }}
        exit={{
          x: -280,
          opacity: 0,
          transition: { duration: 0.25 },
        }}
        className="
          fixed top-0 left-0 z-50 h-screen flex flex-col
          bg-gradient-to-b from-blue-700 via-indigo-700 to-indigo-900
          text-white shadow-2xl backdrop-blur-md
          border-r border-white/10
        "
      >
        {/* Header/logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-center p-4 border-b border-white/10"
        >
          {!isCollapsed ? (
            <h2 className="text-xl font-bold flex items-center gap-2 tracking-wide">
              <span className="text-2xl">🌀</span> OAI CORP
            </h2>
          ) : (
            <div className="text-2xl">🌀</div>
          )}
        </motion.div>

        {/* Nav */}
        <motion.nav
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex-1 flex flex-col gap-2 p-3 overflow-y-auto"
        >
          {navItem(<LayoutDashboard size={18} />, "Dashboard", "/admin/dashboard")}
          {navItem(<Newspaper size={18} />, "Duyệt bài viết", "/admin/posts")}
          {role === "Super Admin" &&
            navItem(<Users size={18} />, "Quản lý người dùng", "/admin/users")}
        </motion.nav>

        {/* Logout */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="p-3"
        >
          <button
            onClick={handleLogout}
            className={`
              flex items-center justify-center gap-2 w-full py-2 rounded-xl
              bg-red-600 hover:bg-red-700 transition-all shadow-md
              ${isCollapsed ? "px-0" : "px-4"}
            `}
          >
            <LogOut size={18} />
            {!isCollapsed && <span>Đăng xuất</span>}
          </button>
        </motion.div>
      </motion.aside>
    </>
  );
}
