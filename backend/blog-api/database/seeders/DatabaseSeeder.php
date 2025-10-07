<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // \App\Models\User::factory(10)->create();

        // \App\Models\User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);

        // 1. Tạo các quyền
    $permissions = [
        'create posts',
        'edit posts',
        'delete posts',
        'approve posts'
    ];

    foreach ($permissions as $perm) {
        Permission::firstOrCreate(['name' => $perm]);
    }

    // 2. Gán quyền cho các role
    $superAdmin = Role::firstOrCreate(['name' => 'Super Admin']);
    $moderator = Role::firstOrCreate(['name' => 'Moderator']);
    $author = Role::firstOrCreate(['name' => 'Author']);
    $member = Role::firstOrCreate(['name' => 'Member']);

    // Super Admin có toàn quyền
    $superAdmin->givePermissionTo(Permission::all());

    // Moderator: duyệt + sửa
    $moderator->syncPermissions(['approve posts', 'edit posts']);

    // Author: tạo, sửa, xóa bài của mình
    $author->syncPermissions(['create posts', 'edit posts', 'delete posts']);

    // Member: không có quyền gì
    }
}
