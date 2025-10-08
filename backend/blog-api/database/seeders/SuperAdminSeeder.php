<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Super Admin
        $admin = User::firstOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('Admin@123'),
                'is_verified' => true,
                'email_verified_at' => now(),
            ]
        );
        $admin->assignRole('Super Admin');

        // Author
        $author = User::firstOrCreate(
            ['email' => 'author@example.com'],
            [
                'name' => 'Author User',
                'password' => Hash::make('Password@123'),
                'is_verified' => true,
                'email_verified_at' => now(),
            ]
        );
        $author->assignRole('Author');

        // Moderator
        $moderator = User::firstOrCreate(
            ['email' => 'moderator@example.com'],
            [
                'name' => 'Moderator User',
                'password' => Hash::make('Password@123'),
                'is_verified' => true,
                'email_verified_at' => now(),
            ]
        );
        $moderator->assignRole('Moderator');

        // Member
        $member = User::firstOrCreate(
            ['email' => 'member@example.com'],
            [
                'name' => 'Member User',
                'password' => Hash::make('Password@123'),
                'is_verified' => true,
                'email_verified_at' => now(),
            ]
        );
        $member->assignRole('Member');
    }
}
