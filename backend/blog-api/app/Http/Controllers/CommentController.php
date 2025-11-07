<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function index(Request $request)
    {
        $postId = $request->query('post_id');

        $comments = Comment::where('post_id', $postId)
            ->whereNull('parent_id')
            ->with([
                'user.profile',              // 👈 lấy avatar của người bình luận
                'replies.user.profile'       // 👈 lấy avatar của người trả lời
            ])
            ->latest()
            ->get();

        return response()->json(['comments' => $comments]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'post_id' => 'required|exists:posts,id',
            'content' => 'required|string|max:2000',
            'parent_id' => 'nullable|exists:comments,id',
        ]);

        $comment = Comment::create([
            'post_id' => $request->post_id,
            'user_id' => $request->user()->id,
            'content' => $request->content,
            'parent_id' => $request->parent_id,
        ]);

        // 👇 Load luôn user.profile để trả về đủ dữ liệu cho frontend
        $comment->load('user.profile');

        return response()->json(['comment' => $comment]);
    }
}
