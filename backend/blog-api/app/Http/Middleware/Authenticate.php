<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    /**
     * Đường dẫn chuyển hướng nếu chưa đăng nhập.
     */
    protected function redirectTo(Request $request): ?string
    {
        return $request->expectsJson() ? null : route('login');
    }

    /**
     * Xử lý khi người dùng chưa xác thực hoặc token hết hạn.
     */
    protected function unauthenticated($request, array $guards)
    {
        // Nếu request là API (axios, fetch, v.v.)
        if ($request->expectsJson()) {
            // Nếu có user (đã xác thực) nhưng thiếu quyền => 403
            if ($request->user()) {
                return response()->json([
                    'message' => '🚫 Bạn không có quyền truy cập tài nguyên này.',
                ], 403);
            }

            // Nếu chưa đăng nhập hoặc token hết hạn => 401
            return response()->json([
                'message' => '🔒 Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn.',
            ], 401);
        }

        // Nếu không phải API thì redirect về trang đăng nhập
        abort(redirect()->guest(route('login')));
    }
}
