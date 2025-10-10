<?php

use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\API\ProfileController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PostController;
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

// -----------------------------------
// 🔐 AUTH ROUTES
// -----------------------------------
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

// -----------------------------------
// 🧑‍💼 ADMIN ROUTES (chỉ Super Admin được quyền)
// -----------------------------------
Route::middleware(['auth:sanctum', 'role:Super Admin'])->prefix('admin')->group(function () {
    Route::get('/users', [UserController::class, 'index']);             // Xem danh sách user
    Route::get('/users/{id}', [UserController::class, 'show']);         // Xem chi tiết user
    Route::put('/users/{id}/role', [UserController::class, 'updateRole']); // Đổi role user
    Route::delete('/users/{id}', [UserController::class, 'destroy']);   // Xóa user

    // 👇 Thêm 2 route phân quyền
    Route::post('/users/{id}/permissions', [UserController::class, 'givePermission']);
    Route::delete('/users/{id}/permissions', [UserController::class, 'revokePermission']);

    // 👤 Super Admin chỉnh sửa profile của người khác
    Route::put('/profiles/{id}', [ProfileController::class, 'update']);
});

// Route::middleware(['auth:sanctum'])->prefix('admin')->group(function () {
//     Route::get('/users', [UserController::class, 'index']);
//     Route::get('/users/{id}', [UserController::class, 'show']);
//     Route::put('/users/{id}/role', [UserController::class, 'updateRole']); // bỏ middleware Super Admin để test các lỗi
//     Route::delete('/users/{id}', [UserController::class, 'destroy']);
// });

// -----------------------------------
// 👤 PROFILE ROUTES (cho người dùng thường)
// -----------------------------------
Route::middleware(['auth:sanctum'])->group(function () {
    // Xem profile cá nhân
    Route::get('/user/profile', [ProfileController::class, 'showSelf']);

    // Cập nhật profile cá nhân
    Route::put('/user/profile', [ProfileController::class, 'update']);

    Route::delete('/avatar', [ProfileController::class, 'deleteAvatar']); // Xóa avatar
    Route::delete('/cover', [ProfileController::class, 'deleteCover']);   // Xóa cover
});

// 🟢 Public route: ai cũng xem được profile công khai
Route::get('/profiles/{username}', [ProfileController::class, 'showByUsername']);


// -----------------------------------
// 📝 POSTS ROUTES (phân quyền theo role / permission)
// -----------------------------------
Route::prefix('posts')->middleware('auth:sanctum')->group(function () {
    Route::get('/', [PostController::class, 'index']); // ai cũng xem được
    Route::get('/{id}', [PostController::class, 'show']);

    // Author: tạo / sửa / xóa bài
    Route::post('/', [PostController::class, 'store'])->middleware('permission:create posts');
    Route::put('/{id}', [PostController::class, 'update'])->middleware('permission:edit posts');
    Route::delete('/{id}', [PostController::class, 'destroy'])->middleware('permission:delete posts');

    // Moderator: duyệt bài
    Route::put('/{id}/approve', [PostController::class, 'approve'])->middleware('permission:approve posts');
});
