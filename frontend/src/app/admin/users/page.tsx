"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

type User = {
  id: number;
  name: string;
  email: string;
  roles: string[];
  permissions?: any[];
};

type CurrentUser = {
  id: number;
  name: string;
  email: string;
  role: string[];
  permissions: string[];
};

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<{
    current_page: number;
    last_page: number;
    total: number;
  } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // 🧩 Lấy user hiện tại
  const fetchCurrentUser = async () => {
    try {
      const res = await api.get("/auth/me");
      setCurrentUser(res.data.user || res.data);
    } catch (err) {
      console.error("Không lấy được current user:", err);
      toast.error("Không thể lấy thông tin người dùng hiện tại!");
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // 🧩 Lấy danh sách users (có phân trang)
  const fetchUsers = async (pageNum = 1) => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/users?page=${pageNum}`);
      setUsers(res.data.users || []);
      setMeta(res.data.meta || null);
    } catch (err) {
      console.error("Lỗi khi lấy users:", err);
      toast.error("Không thể tải danh sách người dùng!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  // 🧩 Đổi role user
  const handleChangeRole = async (userId: number, newRole: string) => {
    if (!newRole) return;

    // 🚫 Không cho đổi role của chính mình (Super Admin)
    if (currentUser && currentUser.id === userId) {
      toast.warning("Bạn không thể thay đổi role của chính mình!");
      return;
    }

    try {
      setLoadingId(userId);
      const res = await api.put(`/admin/users/${userId}/role`, { role: newRole });
      toast.success(res.data.message || "Cập nhật role thành công!");
      await fetchUsers(page); // 🔄 tự động refetch lại list
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Có lỗi xảy ra khi đổi role.");
    } finally {
      setLoadingId(null);
    }
  };

  // 🧩 Tải lại danh sách thủ công
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchUsers(page), fetchCurrentUser()]);
    setRefreshing(false);
    toast.success("Đã tải lại danh sách người dùng!");
  };

  const isSuperAdmin = currentUser?.role?.includes("Super Admin") ?? false;

  if (loading)
    return <div className="p-4">Đang tải danh sách người dùng...</div>;

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Quản lý người dùng</h1>

        <button
          onClick={handleRefresh}
          className={`flex items-center gap-2 border px-3 py-1 rounded-lg text-sm transition ${
            refreshing ? "opacity-60 cursor-not-allowed" : "hover:bg-gray-100"
          }`}
          disabled={refreshing}
        >
          🔄 {refreshing ? "Đang tải..." : "Tải lại danh sách"}
        </button>
      </div>

      {/* Current User Info */}
      {currentUser ? (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4">
          <strong>User hiện tại:</strong> {currentUser.name} ({currentUser.email}) —{" "}
          <span>{(currentUser.role || []).join(", ") || "NO ROLES"}</span>
        </div>
      ) : (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Chưa đăng nhập:</strong> Không thể lấy thông tin user
        </div>
      )}

      {/* Cảnh báo nếu không phải Super Admin */}
      {!isSuperAdmin && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          <strong>Chú ý:</strong> Bạn không có quyền thay đổi role.
        </div>
      )}

      {/* Bảng người dùng */}
      <table className="min-w-full border rounded-lg">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">ID</th>
            <th className="p-2 text-left">Tên</th>
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Vai trò</th>
            {isSuperAdmin && <th className="p-2 text-left">Thay đổi Role</th>}
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const isSelf =
              currentUser?.id === u.id &&
              currentUser?.role?.includes("Super Admin");

            return (
              <tr key={u.id} className="border-t hover:bg-gray-50 transition">
                <td className="p-2">{u.id}</td>
                <td className="p-2">{u.name}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2">{(u.roles || []).join(", ") || "Chưa có role"}</td>

                {isSuperAdmin && (
                  <td className="p-2">
                    <select
                      className={`border rounded px-2 py-1 ${
                        isSelf ? "bg-gray-200 text-gray-500 cursor-not-allowed" : ""
                      }`}
                      onChange={(e) => handleChangeRole(u.id, e.target.value)}
                      defaultValue=""
                      disabled={loadingId === u.id || isSelf}
                      title={
                        isSelf
                          ? "Không thể đổi role của chính bạn"
                          : "Chọn role để thay đổi"
                      }
                    >
                      <option value="">— Chọn role —</option>
                      <option value="Super Admin">Super Admin</option>
                      <option value="Admin">Admin</option>
                      <option value="Moderator">Moderator</option>
                      <option value="Author">Author</option>
                      <option value="Member">Member</option>
                    </select>
                    {loadingId === u.id && (
                      <span className="ml-2 text-sm text-gray-500">
                        Đang cập nhật...
                      </span>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Phân trang */}
      {meta && (
        <div className="flex justify-between items-center mt-4">
          <button
            className="border px-3 py-1 rounded disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            ← Trước
          </button>

          <span>
            Trang {meta.current_page} / {meta.last_page} — Tổng: {meta.total}
          </span>

          <button
            className="border px-3 py-1 rounded disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
            disabled={page >= meta.last_page}
          >
            Sau →
          </button>
        </div>
      )}

      {users.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          Không có người dùng nào
        </div>
      )}
    </div>
  );
}
