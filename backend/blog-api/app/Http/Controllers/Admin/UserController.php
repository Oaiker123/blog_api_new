<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;

class UserController extends Controller
{
    public function index()
    {
        $users = User::with(['roles', 'permissions'])->get();

        $data = $users->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->roles->pluck('name'),
                // 🔥 Lấy đủ quyền của user
                'permissions' => $user->getAllPermissions()->map(function ($perm) {
                    return [
                        'id' => $perm->id,
                        'name' => $perm->name,
                    ];
                })->values(),
            ];
        });

        return response()->json([
            'message' => 'Danh sách người dùng',
            'users' => $data
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

    // 📄 Danh sách tất cả permissions để hiển thị cột
    public function allPermissions()
    {
        $permissions = Permission::all();
        return response()->json($permissions);
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

    public function givePermission(Request $request, $id)
    {
        try {
            $currentUser = auth()->user();
            if (!$currentUser->hasRole('Super Admin')) {
                return response()->json([
                    'message' => 'Bạn không có quyền gán permission cho người khác'
                ], 403);
            }

            $request->validate([
                'permission' => 'required|string|exists:permissions,name',
            ]);

            $user = User::findOrFail($id);

            // ✅ BƯỚC QUAN TRỌNG NHẤT:
            // Đảm bảo bạn đang lấy đúng key 'permission' (số ít) mà bạn đã validate.
            $permission = $request->input('permission');

            if ($user->email === 'admin@gmail.com') {
                return response()->json([
                    'message' => 'Không thể chỉnh sửa quyền của Super Admin'
                ], 403);
            }

            if (!$user->hasPermissionTo($permission)) {
                // Và sử dụng đúng biến '$permission' (số ít) ở đây.
                $user->givePermissionTo($permission);
            }

            return response()->json([
                'message' => 'Phân quyền thành công',
                'user' => [ // ✅ Trả về cấu trúc user đầy đủ
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'roles' => $user->roles->pluck('name'),
                    'permissions' => $user->getAllPermissions()->map(function ($perm) {
                        return [
                            'id' => $perm->id,
                            'name' => $perm->name,
                        ];
                    })->values(),
                ]
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            // Lỗi 500 của bạn đang được bắt ở đây.
            return response()->json([
                'message' => 'Có lỗi xảy ra khi phân quyền',
                'error' => $e->getMessage() // Dòng này sẽ cho bạn biết lỗi cụ thể là gì
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
