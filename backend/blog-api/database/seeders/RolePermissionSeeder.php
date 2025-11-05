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

            // 💬 Bình luận
            'create comments',
            'delete comments',
            'approve comments',

            // ❤️ Tương tác
            'like posts',
            'bookmark posts',

            // 📊 Báo cáo / thống kê
            'view analytics',
        ];

        // ✅ Tạo quyền nếu chưa có
        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'web']);
        }

        // ✅ Tạo roles
        $superAdmin = Role::firstOrCreate(['name' => 'Super Admin']);
        $admin      = Role::firstOrCreate(['name' => 'Admin']);
        $moderator  = Role::firstOrCreate(['name' => 'Moderator']);
        $author     = Role::firstOrCreate(['name' => 'Author']);
        $member     = Role::firstOrCreate(['name' => 'Member']);

        // ✅ Super Admin có tất cả quyền
        $superAdmin->syncPermissions(Permission::all());

        // ✅ Các role khác chỉ có quyền chỉnh hồ sơ cá nhân (chưa có user gán)
        $onlyProfile = ['edit own profile'];
        $admin->syncPermissions($onlyProfile);
        $moderator->syncPermissions($onlyProfile);
        $author->syncPermissions($onlyProfile);
        $member->syncPermissions($onlyProfile);

        $this->command->info('✅ Roles & Permissions seeded successfully!');
    }
}
