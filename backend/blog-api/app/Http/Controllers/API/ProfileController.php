<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Profile;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    /**
     * 🟣 Cập nhật hồ sơ (user hoặc Super Admin)
     */
    public function update(Request $request, $id = null)
    {
        $user = $request->user();

        // ✅ Nếu có ID => Super Admin sửa người khác
        //    Nếu không có ID => user sửa chính họ
        $profile = $id
            ? Profile::findOrFail($id)
            : ($user->profile ?? $user->profile()->create(['user_id' => $user->id]));

        /**
         * 🔐 Kiểm tra quyền
         * - Super Admin → full quyền
         * - Author / Member → chỉ được sửa profile của chính mình
         * - Có quyền edit any profile → OK
         * - Có quyền edit own profile và là chính họ → OK
         */
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
            'location'     => 'nullable|string|max:255',
            'birthdate'    => 'nullable|date|before:today',
            'gender'       => 'nullable|in:male,female,other',
            'phone'        => 'nullable|string|max:20',
            'website'      => 'nullable|url|max:255',
            'visibility'   => 'nullable|in:public,private',
            'social_links' => 'nullable',

            // ⚙️ Upload ảnh
            'avatar'       => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'cover'        => 'nullable|image|mimes:jpeg,png,jpg|max:4096',
        ]);

        /**
        * ✅ Parse social_links nếu gửi dạng chuỗi JSON trong form-data
        * (VD: {"facebook":"https://fb.com/oai","github":"https://github.com/oai"})
        */
        if ($request->filled('social_links')) {
            if (is_string($request->social_links)) {
                $decoded = json_decode($request->social_links, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $validated['social_links'] = json_encode($decoded); // 🔥 encode lại trước khi lưu
                }
            }
        }


        // ✅ Upload Avatar
        if ($request->hasFile('avatar')) {
            if ($profile->avatar_path && Storage::disk('public')->exists($profile->avatar_path)) {
                Storage::disk('public')->delete($profile->avatar_path);
            }
            $validated['avatar_path'] = $request->file('avatar')->store('avatars', 'public');
        }

        // ✅ Upload Cover
        if ($request->hasFile('cover')) {
            if ($profile->cover_path && Storage::disk('public')->exists($profile->cover_path)) {
                Storage::disk('public')->delete($profile->cover_path);
            }
            $validated['cover_path'] = $request->file('cover')->store('covers', 'public');
        }

        // ✅ Update tất cả field (merge validated + file)
        $profile->fill($validated);
        $profile->save();

        return response()->json([
            'message' => 'Profile updated successfully',
            'data' => $this->formatProfile($profile->fresh()),
        ]);
    }

    /**
    * 🧩 Chuẩn hoá dữ liệu profile khi trả về
    */
    private function formatProfile(Profile $profile)
    {
        return [
            'id' => $profile->id,
            'user_id' => $profile->user_id,
            'username' => $profile->username,
            'display_name' => $profile->display_name,
            'bio' => $profile->bio,
            'location' => $profile->location,
            'birthdate' => $profile->birthdate,
            'birthdate_formatted' => $profile->birthdate
                ? \Carbon\Carbon::parse($profile->birthdate)->format('d/m/Y')
                : null,
            'gender' => $profile->gender,
            'phone' => $profile->phone,
            'website' => $profile->website,
            'visibility' => $profile->visibility,
            'social_links' => $profile->social_links ? json_decode($profile->social_links, true) : null,
            'avatar_url' => $profile->avatar_path ? asset('storage/' . $profile->avatar_path) : null,
            'cover_url' => $profile->cover_path ? asset('storage/' . $profile->cover_path) : null,
            'created_at' => $profile->created_at,
            'updated_at' => $profile->updated_at,
        ];
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
            'data' => $this->formatProfile($profile)
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

        if ($profile->visibility === 'private') {
            return response()->json([
                'message' => 'Public profile fetched successfully (limited view)',
                'data' => [
                    'username' => $profile->username,
                    'display_name' => $profile->display_name,
                    'bio' => $profile->bio,
                    'avatar_path' => $profile->avatar_path,
                ]
            ]);
        }

        return response()->json([
            'message' => 'Public profile fetched successfully',
            'data' => $this->formatProfile($profile)
        ]);
    }

    /**
     * 🗑 Xóa avatar
     */
    public function deleteAvatar(Request $request)
    {
        $user = $request->user();
        $profile = $user->profile;

        if (!$profile || !$profile->avatar_path) {
            return response()->json(['message' => 'No avatar to delete'], 404);
        }

        Storage::disk('public')->delete($profile->avatar_path);
        $profile->update(['avatar_path' => null]);

        return response()->json(['message' => 'Avatar deleted successfully']);
    }

    /**
     * 🗑 Xóa ảnh bìa (cover)
     */
    public function deleteCover(Request $request)
    {
        $user = $request->user();
        $profile = $user->profile;

        if (!$profile || !$profile->cover_path) {
            return response()->json(['message' => 'No cover image to delete'], 404);
        }

        Storage::disk('public')->delete($profile->cover_path);
        $profile->update(['cover_path' => null]);

        return response()->json(['message' => 'Cover deleted successfully']);
    }
}
