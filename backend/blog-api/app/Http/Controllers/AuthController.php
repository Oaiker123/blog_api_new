<?php

namespace App\Http\Controllers;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Validation\ValidationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class AuthController extends Controller
{
    // Đăng ký (gửi OTP)
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|string|email|unique:users',
            'password' => 'required|min:6|confirmed',
        ]);

        $otp = rand(100000, 999999);

        $user = User::create([
            'name' => $request->name,
            'email'=> $request->email,
            'password' => Hash::make($request->password),
            'otp_code' => $otp,
            'otp_expires_at' => Carbon::now()->addMinutes(10),
        ]);

        // Gửi OTP qua email
        Mail::raw("Ma OTP xac minh dang ky cua ban la: $otp (het han sau 10 phut).", function ($message) use ($user) {
            $message->to($user->email)->subject('Xac minh tai khoan');
        });

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'message' => 'dang ky thanh cong! Vui long kiem tra email de nhap OTP xac minh.',
            'user_id' => $user->id
        ], 201);
    }

    // Xác minh OTP
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'otp'     => 'required|digits:6',
        ]);

        $user = User::find($request->user_id);

        if (!$user || $user->otp_code !== $request->otp) {
            return response()->json(['message' => 'OTP khong chinh xac!'], 400);
        }

        if (Carbon::now()->greaterThan($user->otp_expires_at)) {
            return response()->json(['message' => 'OTP da het han!'], 400);
        }

        // Xác minh thành công
        $user->email_verified_at = now();
        $user->otp_code = null;
        $user->otp_expires_at = null;
        $user->is_verified = true; // thêm dòng này
        $user->save();

        // Tạo token luôn (tự động đăng nhập)
        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'message' => 'Xac minh thanh cong! Ban da duoc dang nhap.',
            'user'    => $user,
            'token'   => $token
        ]);
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
                'message' => 'Tai khoan khong ton tai!'
            ], 404);
        }

        // Nếu sai mật khẩu
        if (!Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Mat khau khong chinh xac!'
            ], 401);
        }

        if (!$user->email_verified_at) {
            return response()->json(['message' => 'Tai khoan chua xac minh email!'], 403);
        }

        // Nếu đăng nhập đúng
        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'message' => 'dang nhap thanh cong!',
            'user'    => $user,
            'token'   => $token,
        ]);
    }


    // Thông tin user hiện tại
    public function me(Request $request)
    {
        return response()->json([
            'message' => 'Lay thong tin nguoi dung thanh cong',
            'user' => $request->user()
        ]);
    }

    //logout
    public function logout(Request $request)
    {
        $user = $request->user();

        $user->tokens()->delete();

        return response()->json([
            'message' => 'Ban đa đang xuat thanh cong!'
        ], 200);
    }

}
