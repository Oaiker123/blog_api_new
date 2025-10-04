<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Validation\ValidationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    // Đăng ký
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|string|email|unique:users',
            'password' => 'required|min:6|confirmed',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email'=> $request->email,
            'password' => Hash::make($request->password),
        ]);

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'message' => 'Đăng ký thành công!',
            'user'=>$user,
            'token'=>$token,
        ], 201);
    }

    // Đăng nhập
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        // Nếu không có user
        if (!$user) {
            return response()->json([
                'message' => 'Tài khoản không tồn tại!'
            ], 404);
        }

        // Nếu sai mật khẩu
        if (!Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Mật khẩu không chính xác!'
            ], 401);
        }

        // Nếu đăng nhập đúng
        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'message' => 'Đăng nhập thành công bằng email & mật khẩu!',
            'user'    => $user,
            'token'   => $token,
        ]);
    }


    // Thông tin user hiện tại
    public function me(Request $request)
    {
        return response()->json([
            'message' => 'Lấy thông tin người dùng thành công',
            'user' => $request->user()
        ]);
    }

    //logout
    public function logout(Request $request)
    {
        $user = $request->user();

        $user->tokens()->delete();

        return response()->json([
            'message' => 'Bạn đã đăng xuất thành công!'
        ], 200);
    }

}
