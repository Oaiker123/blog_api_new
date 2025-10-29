<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        // 🔄 Xóa toàn bộ user khác (đảm bảo dữ liệu sạch)
        User::where('email', '!=', 'admin@gmail.com')->delete();

        // ✅ Tạo Super Admin duy nhất
        $admin = User::updateOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('Admin@123'),
                'is_verified' => true,
                'email_verified_at' => now(),
            ]
        );

        // ✅ Gán role Super Admin (nếu chưa có)
        if (!$admin->hasRole('Super Admin')) {
            $admin->assignRole('Super Admin');
        }

        $this->command->info('✅ Super Admin user created: admin@gmail.com / Admin@123');
    }
}
