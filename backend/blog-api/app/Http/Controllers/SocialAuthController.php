<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class SocialAuthController extends Controller
{
    // Bước 1: redirect đến trang đăng nhập Google/Facebook/Github
    public function redirect($provider)
    {
        return Socialite::driver($provider)->stateless()->redirect();
    }

    // Bước 2: callback từ provider
    public function callback($provider)
    {
        $socialUser = Socialite::driver($provider)->stateless()->user();

        // Tìm user theo email, nếu chưa có thì tạo mới
        $user = User::firstOrCreate(
            ['email' => $socialUser->getEmail()],
            [
                'name' => $socialUser->getName() ?? $socialUser->getNickname(),
                'password' => Hash::make(Str::random(16)), // random pass
            ]
        );

        // Tạo token đăng nhập API
        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'message' => 'Đăng nhập bằng ' . ucfirst($provider) . ' thành công!',
            'user' => $user,
            'provider' => $provider,
            'token' => $token,
        ]);
    }
}
