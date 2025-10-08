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
            'message' => 'Danh sach bai viet',
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
            'message' => 'Tao bai viet thanh cong, dang cho duyet',
            'post' => $post
        ]);
    }

    // 🟠 Sửa bài viết
    public function update(Request $request, $id)
    {
        $post = Post::findOrFail($id);

        // chỉ cho phép sửa bài của mình hoặc Super Admin
        if ($post->user_id !== Auth::id() && !Auth::user()->hasRole('Super Admin')) {
            return response()->json(['message' => 'Ban khong co quyen sua bai nay'], 403);
        }

        $post->update($request->only('title', 'content'));
        return response()->json(['message' => 'Cap nhat bai viet thanh cong', 'post' => $post]);
    }

    // 🔴 Xóa bài viết
    public function destroy($id)
    {
        $post = Post::findOrFail($id);

        if ($post->user_id !== Auth::id() && !Auth::user()->hasRole('Super Admin')) {
            return response()->json(['message' => 'Ban khong co quyen xoa bai nay'], 403);
        }

        $post->delete();
        return response()->json(['message' => 'da xoa bai viet']);
    }

    // 🟣 Moderator duyệt bài
    public function approve($id)
    {
        $post = Post::findOrFail($id);
        $post->update(['status' => 'approved']);

        return response()->json([
            'message' => 'Bai viet da duoc duyet thanh cong',
            'post' => $post
        ]);
    }
}
