<?php

namespace App\Http\Controllers;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\QueryException;
use Illuminate\Validation\ValidationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        // Validate cơ bản
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'email' => ['required', 'string', 'email', 'unique:users,email'],
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            $errors = $validator->errors();

            $email = $request->email;

            // Kiểm tra email
            if ($errors->has('email')) {
                if (!Str::contains($email, '@')) {
                    return response()->json([
                        'message' => 'Email phai co @'
                    ], 422);
                }

                // 1. Kiểm tra đuôi .com
                if (!preg_match('/\.com$/i', $email)) {
                    return response()->json(['message' => 'Email phai co duoi .com'], 422);
                }

                // 2. Kiểm tra domain hợp lệ
                $domain = substr(strrchr($email, "@"), 1);
                $allowedDomains = ['gmail.com', 'yahoo.com', 'outlook.com'];
                if (!in_array($domain, $allowedDomains)) {
                    return response()->json(['message' => 'Email phai thuoc Gmail, Yahoo hoac Outlook'], 422);
                }

                if (in_array('The email has already been taken.', $errors->get('email'))) {
                    return response()->json([
                        'message' => 'Email da ton tai'
                    ], 422);
                }
            }

            // Kiểm tra password
            if ($errors->has('password')) {
                foreach ($errors->get('password') as $err) {
                    if (Str::contains($err, 'at least 8 characters')) {
                        return response()->json([
                            'message' => 'Mat khau phai co it nhat 8 ky tu'
                        ], 422);
                    }
                    if (Str::contains($err, 'confirmation')) {
                        return response()->json([
                            'message' => 'Mat khau va xac nhan mat khau khong khop'
                        ], 422);
                    }
                }
            }

            // Kiểm tra name hoặc các field rỗng khác
            if ($errors->has('name')) {
                return response()->json([
                    'message' => 'Phai nhap du thong tin (name, email, password)'
                ], 422);
            }
        }

        $name = trim($request->name);
        $email = trim($request->email);
        $password = $request->password;

        // Tạo OTP
        $otp = rand(100000, 999999);
        $otpExpiresAt = Carbon::now()->addMinutes(10);

        try {
            $user = User::create([
                'name' => $name,
                'email' => $email,
                'password' => Hash::make($password),
                'otp_code' => $otp,
                'otp_expires_at' => $otpExpiresAt,
                'is_verified' => false,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Khong the tao user',
                'error' => $e->getMessage()
            ], 500);
        }

        // Gửi OTP
        try {
            Mail::raw("Mã OTP xác minh đăng ký của bạn là: $otp (hết hạn sau 10 phút).", function ($message) use ($user) {
                $message->to($user->email)
                        ->subject('Xác minh tài khoản');
            });
        } catch (\Exception $e) {
            $user->delete();
            return response()->json([
                'message' => 'Không thể gửi OTP. Vui lòng thử lại.',
                'error' => $e->getMessage()
            ], 500);
        }

        return response()->json([
            'message' => 'Đăng ký thành công! Vui lòng kiểm tra email để nhập OTP xác minh.',
            'user_id' => $user->id,
            'otp_expires_at' => $otpExpiresAt->toDateTimeString()
        ], 201);
    }

    // Xác minh OTP
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'otp' => 'required|string|size:6',
        ]);

        $user = User::find($request->user_id);

        if ($user->is_verified) {
            return response()->json(['message' => 'Tai khoan da duoc xac minh!'], 400);
        }

        if ($user->otp_code !== $request->otp) {
            return response()->json(['message' => 'OTP khong chinh xac!'], 400);
        }

        if (Carbon::now()->greaterThan($user->otp_expires_at)) {
            return response()->json(['message' => 'OTP da het han!'], 400);
        }

        // Xác minh thành công
        $user->email_verified_at = now();
        $user->otp_code = null;
        $user->otp_expires_at = null;
        $user->is_verified = true;
        $user->save();

         // 👇 Gán role mặc định sau khi xác minh xong
        $user->assignRole('Member');

        // Tạo token sau khi xác minh
        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'message' => 'Xac minh thanh cong! Ban da duoc dang nhap.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'email_verified_at' => $user->email_verified_at,
            ],
            'token' => $token
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
            return response()->json([
                'message' => 'Tai khoan chua xac minh email!',
                'user_id' => $user->id,
                'email'   => $user->email,
            ], 403);
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
        $user = $request->user()->load('roles', 'permissions');

        return response()->json([
            'message' => 'Lay thong tin nguoi dung thanh cong',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->getRoleNames(), // Lấy danh sách role
                'permissions' => $user->getAllPermissions()->pluck('name'), // Lấy danh sách quyền
            ]
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
