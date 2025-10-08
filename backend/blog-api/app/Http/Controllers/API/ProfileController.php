<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Profile;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    public function update(Request $request, $id = null)
    {
        $user = $request->user();

        // ✅ Nếu có ID => Super Admin sửa người khác
        //    Nếu không có ID => user sửa chính họ
        $profile = $id
            ? Profile::findOrFail($id)
            : ($user->profile ?? $user->profile()->create(['user_id' => $user->id]));

        // ✅ Kiểm tra quyền (viết trực tiếp)
        if ($user->hasRole('Super Admin')) {
            // full quyền
        } elseif (
            ($user->hasRole('Author') || $user->hasRole('Member')) &&
            $user->id === $profile->user_id
        ) {
            // chính họ -> OK
        } elseif ($user->can('edit any profile')) {
            // có quyền đặc biệt -> OK
        } elseif ($user->can('edit own profile') && $user->id === $profile->user_id) {
            // OK
        } else {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // ✅ Validation
        $validated = $request->validate([
            'username'     => ['nullable', 'string', 'max:50', Rule::unique('profiles', 'username')->ignore($profile->id)],
            'display_name' => 'nullable|string|max:100',
            'bio'          => 'nullable|string|max:1000',
            'avatar_path'  => 'nullable|string|max:255',
            'cover_path'   => 'nullable|string|max:255',
            'location'     => 'nullable|string|max:255',
            'birthdate'    => 'nullable|date|before:today',
            'website'      => 'nullable|url|max:255',
            'visibility'   => 'nullable|in:public,private',
        ]);

        $profile->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully',
            'data' => $profile->fresh(),
        ]);
    }

    /**
     * 🧍 Xem profile của chính user (đăng nhập)
     */
    public function showSelf(Request $request)
    {
        $user = $request->user();
        $profile = $user->profile;

        if (!$profile) {
            return response()->json(['message' => 'Profile not found'], 404);
        }

        return response()->json([
            'message' => 'Profile fetched successfully',
            'data' => $profile
        ]);
    }

    /**
     * 🌍 Xem profile công khai của người khác bằng username
     */
    public function showByUsername($username)
    {
        $profile = Profile::where('username', $username)->first();

        if (!$profile) {
            return response()->json(['message' => 'Profile not found'], 404);
        }

        // Nếu profile là private -> chỉ chủ sở hữu hoặc admin mới xem được
        if ($profile->visibility === 'private') {
            return response()->json(['message' => 'This profile is private'], 403);
        }

        return response()->json([
            'message' => 'Public profile fetched successfully',
            'data' => $profile
        ]);
    }
}
