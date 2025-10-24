"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { ChevronDown, ChevronUp } from "lucide-react";
import axios from "axios"; // ✅ Cần import axios để dùng axios.isAxiosError
import { toast } from "sonner";

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

  // 🧠 Lấy dữ liệu user + permission
  const fetchData = async () => {
    try {
      const usersRes = await api.get("/admin/users");
      const permsRes = await api.get("/admin/permissions");

      console.log("usersData:", usersRes.data);
      console.log("permissionsData:", permsRes.data);

      const usersArray = Array.isArray(usersRes.data)
        ? usersRes.data
        : usersRes.data.users;

      const permsArray = Array.isArray(permsRes.data)
        ? permsRes.data
        : permsRes.data.permissions;

      setUsersData(usersArray || []);
      setPermissionsData(permsArray || []);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
      toast.error("Lỗi khi tải dữ liệu người dùng/quyền. Vui lòng kiểm tra console.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  
  // 🔄 Hàm cập nhật state Users
  const updateUsersState = (updatedUser: User) => {
    setUsersData(prevUsers => 
        prevUsers.map(user => 
            user.id === updatedUser.id ? updatedUser : user
        )
    );
  };

  // 🧩 Hàm gán/gỡ quyền
  const handlePermissionChange = async (
    userId: number,
    permissionName: string,
    hasPermission: boolean // ✅ Thêm tham số trạng thái hiện tại
  ) => {
    // 1. Xác định URL và phương thức
    const url = `/admin/users/${userId}/permissions`;
    // Nếu chưa có quyền: Gán (POST). Nếu đã có quyền: Gỡ (DELETE).
    // Tuy nhiên, logic UI của bạn chỉ cho phép bấm khi `!hasPermission` (chưa có quyền)
    // Để tiện cho việc thêm logic gỡ quyền sau này, ta nên đổi check.
    // Dựa trên UI, ta chỉ gọi hàm này khi CHƯA có quyền. Nếu muốn gỡ quyền,
    // ta cần sửa disabled logic.

    // 💡 Tạm thời, mình chỉ làm logic GÁN quyền (POST), vì checkbox của bạn đang disabled khi đã có quyền.
    // Nếu bạn muốn GỠ quyền, bạn phải sửa lại thuộc tính `disabled` của <input> bên dưới.

    try {
      // ⚙️ Gọi API gán quyền
      const response = await api.post(url, {
        permission: permissionName, // Gửi lên một string tên là "permission"
      });

      // ✅ Xử lý thành công
      if (response.status === 200) {
        toast.success(response.data.message || "Gán quyền thành công!");
        
        // Cập nhật state trực tiếp nếu backend trả về data user đã cập nhật
        if (response.data.user) {
            updateUsersState(response.data.user);
        } else {
            // Trường hợp backend không trả về user đầy đủ, gọi lại API
            fetchData();
        }
      }
    } catch (error) {
      // ✅ Xử lý thất bại (403, 422, 500)
      let errorMessage = "Đã có lỗi xảy ra. Vui lòng thử lại.";
      
      if (axios.isAxiosError(error) && error.response) {
        const { status, data } = error.response;
        
        if (status === 403) {
            errorMessage = data.message || "Bạn không có quyền thực hiện hành động này.";
        } else if (status === 422) {
            errorMessage = data.message || "Dữ liệu không hợp lệ.";
            // Bạn có thể xử lý error.response.data.errors nếu cần hiển thị validation chi tiết
        } else if (status === 500) {
             errorMessage = data.message || "Lỗi Server nội bộ (500).";
        } else {
            errorMessage = data.message || `Lỗi ${status}.`;
        }
      }

      toast.error(`THẤT BẠI: ${errorMessage}`);
      console.error("Lỗi khi cập nhật quyền:", error);
    }
  };
  
  // 🚩 Hàm xử lý cho checkbox: Bấm vào thì Gán/Gỡ
  const handleCheckboxChange = (
    user: User, 
    perm: Permission, 
    hasPermission: boolean
  ) => {
    // Super Admin không làm gì cả
    if (user.email === "admin@gmail.com") return;
    
    if (!hasPermission) {
        // Nếu chưa có quyền -> GÁN (POST)
        handlePermissionChange(user.id, perm.name, false);
    } else {
        // Nếu ĐÃ có quyền -> GỠ (DELETE)
        // 🔥 LƯU Ý: Nếu bạn muốn GỠ quyền, bạn phải BẬT thuộc tính `disabled` của <input>
        // và thay thế `handlePermissionChange` bằng logic DELETE.
        // Hiện tại, logic UI của bạn đang không cho phép gỡ quyền (disabled={hasPermission})
        
        // TẠM THỜI: Nếu bạn chỉ muốn GÁN, không cần sửa gì thêm.
        // Nếu muốn GỠ, hãy sửa dòng `disabled` bên dưới.
        
        // Nếu bạn đã sửa logic UI để cho phép GỠ quyền, đây là cách gọi GỠ:
        // handleRevokePermission(user.id, perm.name); 
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Phân quyền người dùng</h2>

      {usersData.map((user) => {
        const isSuperAdmin = user.email === "admin@gmail.com";

        return (
          <div
            key={user.id}
            className="border rounded-2xl p-4 mb-3 shadow-sm bg-white transition-all"
          >
            {/* Header user */}
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() =>
                setExpandedUser(expandedUser === user.id ? null : user.id)
              }
            >
              <div>
                <p className="font-semibold text-gray-800">{user.name}</p>
                <p className="text-gray-500 text-sm">{user.email}</p>
              </div>
              {expandedUser === user.id ? <ChevronUp /> : <ChevronDown />}
            </div>

            {/* Danh sách quyền */}
            {expandedUser === user.id && (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {permissionsData.map((perm) => {
                  const hasPermission = user.permissions?.some(
                    (p) => p.name === perm.name
                  );

                  return (
                    <div
                      key={perm.id}
                      className="flex items-center space-x-2"
                      title={
                        isSuperAdmin
                          ? "Super Admin - không thể chỉnh sửa"
                          : hasPermission
                          ? "Đã có quyền này"
                          : ""
                      }
                    >
                      <input
                        type="checkbox"
                        checked={hasPermission}
                        // SỬA ĐIỀU KIỆN DISABLED NẾU BẠN MUỐN GỠ QUYỀN
                        disabled={isSuperAdmin} 
                        onChange={() =>
                           handleCheckboxChange(user, perm, hasPermission)
                        }
                        className={`h-4 w-4 rounded ${
                          isSuperAdmin
                            ? "cursor-not-allowed opacity-50"
                            : "cursor-pointer"
                        }`}
                      />
                      <label
                        className={`text-sm ${
                          hasPermission || isSuperAdmin
                            ? "text-gray-400"
                            : "text-gray-800"
                        }`}
                      >
                        {perm.name}
                      </label>
                    </div>
                  );
                })}
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
    </div>
  );
}