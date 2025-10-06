<?php

use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SocialAuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
//     return $request->user();
// });

// Auth routes
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
    Route::post('/resend-otp', [AuthController::class, 'resendOtp']);

    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('/me', [AuthController::class, 'me'])->middleware('auth:sanctum');

    Route::get('/{provider}/redirect', [SocialAuthController::class, 'redirect']);
    Route::get('/{provider}/callback', [SocialAuthController::class, 'callback']);
});

// 🧑‍💼 ADMIN ROUTES (chỉ Super Admin được quyền)
Route::middleware(['auth:sanctum', 'role:Super Admin'])->prefix('admin')->group(function () {
    Route::get('/users', [UserController::class, 'index']);           // Xem danh sách user
    Route::get('/users/{id}', [UserController::class, 'show']);       // Xem chi tiết 1 user
    Route::put('/users/{id}/role', [UserController::class, 'updateRole']); // Đổi role user
    Route::delete('/users/{id}', [UserController::class, 'destroy']); // Xóa user
});
