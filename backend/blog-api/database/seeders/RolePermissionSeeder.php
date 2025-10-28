<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run()
    {
        // 🧩 Danh sách quyền (permissions)
        $permissions = [
            // ⚙️ Quyền hệ thống / admin
            'access-admin',

            // 📝 Quyền bài viết
            'create posts',
            'edit posts',
            'delete posts',
            'approve posts',

            // 👤 Quyền người dùng
            'view users',
            'create users',
            'edit users',
            'delete users',
            'update roles',

            // 🧑‍💻 Quyền hồ sơ cá nhân
            'edit own profile',
            'edit any profile',
        ];

        // ✅ Tạo các quyền nếu chưa có
        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'web']);
        }

        // ✅ Tạo các vai trò (roles)
        $superAdmin = Role::firstOrCreate(['name' => 'Super Admin']);
        $moderator  = Role::firstOrCreate(['name' => 'Moderator']);
        $author     = Role::firstOrCreate(['name' => 'Author']);
        $member     = Role::firstOrCreate(['name' => 'Member']);

        // ✅ Gán quyền cho từng vai trò
        // Super Admin: tất cả quyền
        $superAdmin->syncPermissions(Permission::all());

        // Moderator: có thể vào admin + duyệt / sửa bài
        $moderator->syncPermissions([
            'access-admin',
            'approve posts',
            'edit posts',
            'edit own profile',
        ]);

        // Author: có thể vào admin + tạo/sửa/xóa bài + sửa hồ sơ riêng
        $author->syncPermissions([
            'access-admin',
            'create posts',
            'edit posts',
            'delete posts',
            'edit own profile',
        ]);

        // Member: chỉ sửa hồ sơ riêng, không vào admin
        $member->syncPermissions([
            'edit own profile',
        ]);

        $this->command->info('✅ Roles & Permissions seeded successfully!');
    }
}
