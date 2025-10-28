"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

interface Permission {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  permissions: Permission[];
}

export default function PermissionsPage() {
  const [usersData, setUsersData] = useState<User[]>([]);
  const [permissionsData, setPermissionsData] = useState<Permission[]>([]);
  const [expandedUser, setExpandedUser] = useState<number | null>(null);
  const [selectedPerms, setSelectedPerms] = useState<Record<number, string[]>>({});
  const [originalPerms, setOriginalPerms] = useState<Record<number, string[]>>({});
  const [loading, setLoading] = useState<boolean>(false);

  // Modal xác nhận
  const [confirmUser, setConfirmUser] = useState<User | null>(null);

  // 🧠 Lấy dữ liệu
  const fetchData = async () => {
    try {
      const [usersRes, permsRes] = await Promise.all([
        api.get("/admin/users"),
        api.get("/admin/permissions"),
      ]);

      const usersArray = Array.isArray(usersRes.data)
        ? usersRes.data
        : usersRes.data.users;
      const permsArray = Array.isArray(permsRes.data)
        ? permsRes.data
        : permsRes.data.permissions;

      setUsersData(usersArray || []);
      setPermissionsData(permsArray || []);

      // Khởi tạo selectedPerms + originalPerms cho mỗi user
      const init: Record<number, string[]> = {};
      (usersArray || []).forEach((u: User) => {
        init[u.id] = u.permissions.map((p) => p.name);
      });
      setSelectedPerms(init);
      setOriginalPerms(init);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
      toast.error("Không thể tải dữ liệu người dùng hoặc quyền!");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🔁 Toggle quyền trong state tạm
  const togglePermission = (userId: number, permName: string) => {
    setSelectedPerms((prev) => {
      const current = prev[userId] || [];
      const exists = current.includes(permName);
      const updated = exists
        ? current.filter((p) => p !== permName)
        : [...current, permName];
      return { ...prev, [userId]: updated };
    });
  };

  // 🔍 Kiểm tra xem user có thay đổi quyền chưa
  const hasChanges = (userId: number) => {
    const current = selectedPerms[userId] || [];
    const original = originalPerms[userId] || [];
    if (current.length !== original.length) return true;
    const sortedCur = [...current].sort();
    const sortedOrg = [...original].sort();
    return sortedCur.some((perm, i) => perm !== sortedOrg[i]);
  };

  // 💾 Lưu quyền
  const savePermissions = async (userId: number) => {
    setLoading(true);
    try {
      const permissions = selectedPerms[userId] || [];
      const res = await api.post(`/admin/users/${userId}/permissions`, {
        permissions,
        bulk: true,
      });

      if (res.status === 200) {
        toast.success("✅ Cập nhật quyền thành công!");
        await fetchData();
      }
    } catch (error) {
      console.error("Lỗi khi lưu quyền:", error);
      let msg = "Không thể cập nhật quyền.";
      if (axios.isAxiosError(error) && error.response) {
        msg = error.response.data.message || msg;
      }
      toast.error(msg);
    } finally {
      setLoading(false);
      setConfirmUser(null);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto relative">
      <h2 className="text-xl font-semibold mb-4">
        ⚙️ Quản lý phân quyền người dùng
      </h2>

      {usersData.map((user) => {
        const isSuperAdmin = user.email === "admin@gmail.com";
        const isExpanded = expandedUser === user.id;
        const changed = hasChanges(user.id);

        return (
          <div
            key={user.id}
            className="border rounded-2xl p-4 mb-3 shadow-sm bg-white transition hover:shadow-md"
          >
            {/* Header user */}
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setExpandedUser(isExpanded ? null : user.id)}
            >
              <div>
                <p className="font-semibold text-gray-800">{user.name}</p>
                <p className="text-gray-500 text-sm">{user.email}</p>
              </div>
              {isExpanded ? <ChevronUp /> : <ChevronDown />}
            </div>

            {/* Danh sách quyền */}
            {isExpanded && (
              <div className="mt-4 space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {permissionsData.map((perm) => {
                    const hasPermission =
                      selectedPerms[user.id]?.includes(perm.name);
                    return (
                      <label
                        key={perm.id}
                        className={`flex items-center space-x-2 cursor-pointer rounded-md p-2 ${
                          isSuperAdmin
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-gray-50 transition"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={hasPermission}
                          disabled={isSuperAdmin}
                          onChange={() => togglePermission(user.id, perm.name)}
                          className="h-4 w-4 accent-blue-600"
                        />
                        <span
                          className={`text-sm ${
                            hasPermission
                              ? "text-gray-800 font-medium"
                              : "text-gray-500"
                          }`}
                        >
                          {perm.name}
                        </span>
                      </label>
                    );
                  })}
                </div>

                {!isSuperAdmin && (
                  <button
                    onClick={() => setConfirmUser(user)}
                    disabled={loading || !changed}
                    className={`px-4 py-2 rounded-lg text-white flex items-center justify-center transition ${
                      changed
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-gray-300 cursor-not-allowed"
                    }`}
                  >
                    {loading && confirmUser?.id === user.id ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      "💾"
                    )}
                    Lưu thay đổi
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {usersData.length === 0 && (
        <p className="text-center text-gray-500 mt-6">
          Không có người dùng nào.
        </p>
      )}

      {/* 🪟 Modal xác nhận */}
      {confirmUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-sm animate-fade-in-up">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Xác nhận lưu thay đổi
            </h3>
            <p className="text-gray-600 mb-4 text-sm leading-relaxed">
              Bạn có chắc muốn lưu thay đổi quyền cho người dùng{" "}
              <span className="font-medium text-blue-600">
                {confirmUser.name}
              </span>{" "}
              không?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmUser(null)}
                className="px-3 py-1.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 transition"
              >
                Hủy
              </button>
              <button
                onClick={() => savePermissions(confirmUser.id)}
                disabled={loading}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition flex items-center justify-center disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  "Xác nhận"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
