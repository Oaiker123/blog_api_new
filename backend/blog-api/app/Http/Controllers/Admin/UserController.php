<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;

class UserController extends Controller
{
    // 📋 Danh sách người dùng
    public function index()
    {
        // ✅ Phân trang 10 người dùng mỗi trang
        $users = User::with(['roles', 'permissions'])->paginate(3);

        // ✅ Duyệt qua từng user trong trang hiện tại
        $data = collect($users->items())->map(function ($user) {
            return [
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
            ];
        });

        return response()->json([
            'message' => 'Danh sách người dùng',
            'users' => $data,
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'total' => $users->total(),
            ],
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


    // 🔁 Cập nhật role của user
    public function updateRole(Request $request, $id)
    {
        try {
            $currentUser = auth()->user();

            // 🛡️ Chỉ Super Admin được phép đổi role
            if (!$currentUser->hasRole('Super Admin')) {
                return response()->json([
                    'message' => 'Bạn không có quyền thực hiện hành động này.'
                ], 403);
            }

            // 🧾 Validate role hợp lệ
            $validated = $request->validate([
                'role' => 'required|string|exists:roles,name',
            ]);

            // 🔍 Tìm user cần đổi role
            $user = User::findOrFail($id);

            // ❌ Chặn đổi role cho chính mình
            if ($user->id === $currentUser->id) {
                return response()->json([
                    'message' => 'Không thể thay đổi role của chính bạn để tránh mất quyền truy cập admin.'
                ], 403);
            }

            // ❌ Chặn đổi role của Super Admin mặc định
            if ($user->email === 'admin@gmail.com') {
                return response()->json([
                    'message' => 'Không thể thay đổi role của Super Admin mặc định.'
                ], 403);
            }

            // 🔁 Gán role mới
            $user->syncRoles([$validated['role']]);

            // ⚙️ Gán quyền mặc định cho role đó
            $defaultPermissions = [
                'Super Admin' => Permission::all()->pluck('name')->toArray(),
                'Admin'       => ['access-admin', 'edit own profile'],
                'Moderator'   => ['edit own profile'],
                'Author'      => ['edit own profile'],
                'Member'      => ['edit own profile'],
            ];

            $roleName = $validated['role'];
            $permissionsToAssign = $defaultPermissions[$roleName] ?? ['edit own profile'];

            $user->syncPermissions($permissionsToAssign);

            return response()->json([
                'message' => "Cập nhật role thành công thành '{$roleName}'.",
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'roles' => $user->getRoleNames(),
                    'permissions' => $user->getAllPermissions()->pluck('name'),
                ],
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Dữ liệu không hợp lệ.',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Đã xảy ra lỗi khi cập nhật role.',
                'error' => $e->getMessage(),
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
        $currentUser = auth()->user();
        if (!$currentUser->hasRole('Super Admin')) {
            return response()->json(['message' => 'Bạn không có quyền gán quyền.'], 403);
        }

        $user = User::findOrFail($id);

        if ($user->email === 'admin@gmail.com') {
            return response()->json(['message' => 'Không thể chỉnh sửa Super Admin'], 403);
        }

        // Nếu frontend gửi mảng => bulk update
        if ($request->has('permissions') && is_array($request->permissions)) {
            $request->validate([
                'permissions' => 'nullable|array',
                'permissions.*' => 'string|exists:permissions,name',
            ]);

            // 🔹 Nếu mảng trống -> tự động gán quyền mặc định
            $permissions = $request->permissions;
            if (empty($permissions)) {
                $permissions = ['edit own profile'];
            }

            $user->syncPermissions($permissions);

            return response()->json([
                'message' => 'Cập nhật quyền hàng loạt thành công',
                'user' => $user->load('permissions'),
            ]);
        }

        // Ngược lại, nếu chỉ gán 1 quyền
        $request->validate([
            'permission' => 'required|string|exists:permissions,name',
        ]);

        if ($user->hasPermissionTo($request->permission)) {
            return response()->json(['message' => 'Người dùng đã có quyền này'], 422);
        }

        $user->givePermissionTo($request->permission);

        return response()->json([
            'message' => 'Gán quyền thành công',
            'user' => $user->load('permissions'),
        ]);
    }



    // 📌 Gỡ quyền của user (chỉ Super Admin được phép)
    public function revokePermission(Request $request, $id)
    {
        try {
            // 1️⃣ Kiểm tra quyền Super Admin
            $currentUser = auth()->user();
            if (!$currentUser->hasRole('Super Admin')) {
                return response()->json([
                    'message' => 'Bạn không có quyền thu hồi permission'
                ], 403);
            }

            // 2️⃣ Validate input
            $request->validate([
                'permissions' => 'required|array',
                'permissions.*' => 'string|exists:permissions,name',
            ]);

            // 3️⃣ Tìm user
            $user = User::findOrFail($id);

            if ($user->hasRole('Super Admin')) {
                return response()->json(['message' => 'Không thể thu hồi quyền của Super Admin khác'], 403);
            }

            if ($user->id === $currentUser->id) {
                return response()->json(['message' => 'Không thể tự gỡ quyền của chính mình'], 403);
            }



            // 4️⃣ Gỡ từng quyền
            foreach ($request->permissions as $perm) {
                if ($user->hasPermissionTo($perm)) {
                    // Nếu quyền đến từ role -> gỡ khỏi role trước
                    foreach ($user->roles as $role) {
                        if ($role->hasPermissionTo($perm)) {
                            $role->revokePermissionTo($perm);
                        }
                    }

                    // Sau đó mới gỡ trực tiếp khỏi user (nếu có)
                    if ($user->hasDirectPermission($perm)) {
                        $user->revokePermissionTo($perm);
                    }
                }
            }


            return response()->json([
                'message' => 'Thu hồi quyền thành công',
                'user' => $user->load('roles', 'permissions')
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Có lỗi xảy ra khi thu hồi quyền',
                'error' => $e->getMessage()
            ], 500);
        }
    }


}
