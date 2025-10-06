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
        $request->validate([
            'role' => 'required|string|exists:roles,name'
        ]);

        $user = User::findOrFail($id);

        // Gán role mới
        $user->syncRoles([$request->role]);

        return response()->json([
            'message' => 'Cap nhat role thanh cong',
            'user' => $user->load('roles')
        ]);
    }

    // ❌ Xóa user
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(['message' => 'da xoa nguoi dung thanh cong']);
    }
}
