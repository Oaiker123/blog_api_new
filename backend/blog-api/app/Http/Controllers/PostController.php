<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PostController extends Controller
{
    // 🟢 Lấy tất cả bài viết
    public function index()
    {
        $posts = Post::with('user:id,name')->latest()->get();
        return response()->json([
            'message' => 'Danh sách bài viết',
            'posts' => $posts
        ]);
    }

    // 🟢 Xem chi tiết 1 bài viết
    public function show($id)
    {
        $post = Post::with('user:id,name')->findOrFail($id);
        return response()->json(['post' => $post]);
    }

    // 🟡 Tạo bài viết (Author)
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        $post = Post::create([
            'user_id' => Auth::id(),
            'title' => $request->title,
            'content' => $request->content,
            'status' => 'pending'
        ]);

        return response()->json([
            'message' => 'Tạo bài viết thành công, đang chờ duyệt',
            'post' => $post
        ]);
    }

    // 🟠 Sửa bài viết
    public function update(Request $request, $id)
    {
        $post = Post::findOrFail($id);

        // chỉ cho phép sửa bài của mình hoặc Super Admin
        if ($post->user_id !== Auth::id() && !Auth::user()->hasRole('Super Admin')) {
            return response()->json(['message' => 'Bạn không có quyền sửa bài này'], 403);
        }

        $post->update($request->only('title', 'content'));
        return response()->json(['message' => 'Cập nhật bài viết thành công', 'post' => $post]);
    }

    // 🔴 Xóa bài viết
    public function destroy($id)
    {
        $post = Post::findOrFail($id);

        if ($post->user_id !== Auth::id() && !Auth::user()->hasRole('Super Admin')) {
            return response()->json(['message' => 'Bạn không có quyền xóa bài này'], 403);
        }

        $post->delete();
        return response()->json(['message' => 'Đã xóa bài viết']);
    }

    // 🟣 Moderator duyệt bài
    public function approve($id)
    {
        $post = Post::findOrFail($id);
        $post->update(['status' => 'approved']);

        return response()->json([
            'message' => 'Bài viết đã được duyệt thành công',
            'post' => $post
        ]);
    }
}
