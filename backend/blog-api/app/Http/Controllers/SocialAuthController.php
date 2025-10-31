<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class SocialAuthController extends Controller
{
    // Bước 1: Redirect đến Google/Facebook/Github
    public function redirect($provider)
    {
        return Socialite::driver($provider)->stateless()->redirect();
    }

    // Bước 2: Callback từ provider
    public function callback($provider)
    {
        try {
            $socialUser = Socialite::driver($provider)->stateless()->user();

            $user = User::firstOrCreate(
                ['email' => $socialUser->getEmail()],
                [
                    'name' => $socialUser->getName() ?? $socialUser->getNickname(),
                    'password' => Hash::make(Str::random(16)),
                    'email_verified_at' => now(),
                    'is_verified' => 1,
                ]
            );


            // 🔥 Gán role & quyền mặc định an toàn
            if ($user->wasRecentlyCreated) {
                try {
                    if (! $user->hasRole('Member')) {
                        $user->assignRole('Member');
                    }

                    if (! $user->hasPermissionTo('view posts')) {
                        $user->givePermissionTo('view posts');
                    }
                } catch (\Throwable $e) {
                    \Log::error("Gán role hoặc quyền thất bại: " . $e->getMessage());
                }
            }

            $token = $user->createToken('api-token')->plainTextToken;

            $frontendUrl = config('app.frontend_url', 'http://localhost:3000/social-callback');

            return redirect()->away(
                $frontendUrl .
                '?token=' . urlencode($token) .
                '&user=' . urlencode(json_encode([
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ]))
            );

        } catch (\Exception $e) {
            $frontendUrl = config('app.frontend_url', 'http://localhost:3000/login');
            return redirect()->away($frontendUrl . '?error=' . urlencode($e->getMessage()));
        }
    }
}
