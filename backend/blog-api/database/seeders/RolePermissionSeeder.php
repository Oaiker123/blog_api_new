<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run()
    {
        // Tạo permission
        $permissions = [
            'manage_users',
            'approve_posts',
            'create_posts',
            'edit_own_posts',
            'delete_own_posts',
            'view_posts'
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Tạo role và gán quyền
        $superAdmin = Role::firstOrCreate(['name' => 'Super Admin']);
        $moderator = Role::firstOrCreate(['name' => 'Moderator']);
        $author = Role::firstOrCreate(['name' => 'Author']);
        $member = Role::firstOrCreate(['name' => 'Member']);

        $superAdmin->givePermissionTo(Permission::all());
        $moderator->givePermissionTo(['approve_posts', 'view_posts']);
        $author->givePermissionTo(['create_posts', 'edit_own_posts', 'delete_own_posts', 'view_posts']);
        $member->givePermissionTo(['view_posts']);
    }
}

