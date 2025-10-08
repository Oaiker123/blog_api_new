<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    // 📄 Lấy danh sách tất cả user
    public function index()
    {
        $users = User::with('roles')->get();

        return response()->json([
            'message' => 'Danh sach nguoi dung',
            'users' => $users
        ]);
    }

    // 👤 Xem chi tiết 1 user
    public function show($id)
    {
        $user = User::with('roles')->findOrFail($id);

        return response()->json([
            'message' => 'Chi tiet nguoi dung',
            'user' => $user
        ]);
    }

    // 🔁 Cập nhật role người dùng
    public function updateRole(Request $request, $id)
    {
        try {
            // 1️⃣ Chỉ Super Admin được phép đổi role
            $currentUser = auth()->user();
            if (!$currentUser->hasRole('Super Admin')) {
                return response()->json([
                    'message' => 'Ban khong co quyen thuc hien hanh dong nay'
                ], 403);
            }

            // 2️⃣ Validate role hợp lệ
            $validated = $request->validate([
                'role' => 'required|string|exists:roles,name'
            ]);

            // 3️⃣ Tìm user cần cập nhật
            $user = User::find($id);
            if (!$user) {
                return response()->json([
                    'message' => 'Nguoi dung khong ton tai'
                ], 404);
            }

            // 4️⃣ Cập nhật role
            $user->syncRoles([$validated['role']]);

            return response()->json([
                'message' => 'Cap nhat role thanh cong',
                'user' => $user->load('roles')
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            // 5️⃣ Role không hợp lệ
            return response()->json([
                'message' => 'Du lieu khong hop le',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            // 6️⃣ Lỗi không mong đợi khác
            return response()->json([
                'message' => 'Co loi xay ra khi cap nhat role',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    // ❌ Xóa user
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(['message' => 'da xoa nguoi dung thanh cong']);
    }

    // 📌 Gán quyền cho user (chỉ Super Admin được phép)
    public function givePermission(Request $request, $id)
    {
        try {
            // 1️⃣ Kiểm tra người đang đăng nhập có phải Super Admin không
            $currentUser = auth()->user();
            if (!$currentUser->hasRole('Super Admin')) {
                return response()->json([
                    'message' => 'Ban khong co quyen gan permission cho nguoi dung khac'
                ], 403);
            }

            // 2️⃣ Validate input
            $request->validate([
                'permissions' => 'required|array',
                'permissions.*' => 'string|exists:permissions,name',
            ]);

            // 3️⃣ Tìm user cần cấp quyền
            $user = User::findOrFail($id);

            // 4️⃣ Gán quyền
            $user->givePermissionTo($request->permissions);

            return response()->json([
                'message' => 'Phan quyen thanh cong',
                'user' => $user->load('roles', 'permissions')
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Du lieu khong hop le',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Co loi xay ra khi phan quyen',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // 📌 Gỡ quyền của user (chỉ Super Admin được phép)
    public function revokePermission(Request $request, $id)
    {
        try {
            // 1️⃣ Kiểm tra quyền Super Admin
            $currentUser = auth()->user();
            if (!$currentUser->hasRole('Super Admin')) {
                return response()->json([
                    'message' => 'Ban khong co quyen thu hoi permission'
                ], 403);
            }

            // 2️⃣ Validate input
            $request->validate([
                'permissions' => 'required|array',
                'permissions.*' => 'string|exists:permissions,name',
            ]);

            // 3️⃣ Tìm user
            $user = User::findOrFail($id);

            // 4️⃣ Gỡ quyền
            $user->revokePermissionTo($request->permissions);

            return response()->json([
                'message' => 'Thu hoi quyen thanh cong',
                'user' => $user->load('roles', 'permissions')
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Du lieu khong hop le',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Co loi xay ra khi thu hoi quyen',
                'error' => $e->getMessage()
            ], 500);
        }
    }

}
