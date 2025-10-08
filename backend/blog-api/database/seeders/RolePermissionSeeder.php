<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run()
    {
        // ✅ Danh sách permission
        $permissions = [
            // Quyền bài viết
            'create posts',
            'edit posts',
            'delete posts',
            'approve posts',

            // Quyền người dùng
            'view users',
            'create users',
            'edit users',
            'delete users',
            'update roles',

            // Quyền profile
            'edit own profile',
            'edit any profile',

        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm]);
        }

        // ✅ Tạo các role
        $superAdmin = Role::firstOrCreate(['name' => 'Super Admin']);
        $moderator = Role::firstOrCreate(['name' => 'Moderator']);
        $author = Role::firstOrCreate(['name' => 'Author']);
        $member = Role::firstOrCreate(['name' => 'Member']);

        // ✅ Gán quyền
        $superAdmin->givePermissionTo(Permission::all());
        $moderator->syncPermissions(['approve posts', 'edit posts']);
        $author->syncPermissions(['create posts', 'edit posts', 'delete posts', 'edit own profile']);
        $member->syncPermissions(['edit own profile']); // Member không có quyền
    }
}

