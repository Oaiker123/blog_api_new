<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Post;
use App\Models\Media;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class PostController extends Controller
{
    // 🟢 Lấy danh sách bài viết (đã duyệt hoặc của chính user)
    public function index()
    {
        $user = Auth::user();

        $posts = Post::with([
            'user:id,name',
            'category:id,name',
            'tags:id,name',
            'media:id,post_id,url,type'
        ])
            ->when(!$user?->hasRole('Super Admin'), function ($query) use ($user) {
                $query->where(function ($q) use ($user) {
                    $q->where('status', 'approved')
                      ->orWhere('user_id', $user->id);
                });
            })
            ->latest()
            ->get();

        return response()->json([
            'message' => 'Danh sách bài viết',
            'posts' => $posts
        ]);
    }

    // 🟣 Xem chi tiết bài viết
    public function show($id)
    {
        $post = Post::with([
            'user:id,name',
            'category:id,name',
            'comments.user:id,name',
            'tags:id,name',
            'media:id,post_id,url,type,caption'
        ])->findOrFail($id);

        return response()->json(['post' => $post]);
    }

    // 🟡 Tạo bài viết
    public function store(Request $request)
    {
        $user = $request->user();

        // 🧩 Validate
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'slug'        => 'required|string|max:255|unique:posts,slug',
            'excerpt'     => 'nullable|string|max:500',
            'content'     => 'required|string',
            'category_id' => 'nullable|exists:categories,id',
            'status'      => 'required|in:draft,pending,approved,rejected',
            'thumbnail'   => 'nullable|image|max:5120', // 5MB
            'images'      => 'nullable|array',
            'images.*'    => 'image|max:5120',
            'tags'        => 'nullable|string',
        ]);

        // 🖼️ Upload thumbnail chính
        if ($request->hasFile('thumbnail')) {
            $validated['thumbnail'] = $request->file('thumbnail')->store('thumbnails', 'public');
        }

        $validated['user_id'] = $user->id;

        // 🧩 Tạo bài viết
        $post = Post::create($validated);

        // 🖼️ Upload ảnh minh họa vào bảng media
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $path = $file->store('media', 'public');

                Media::create([
                    'post_id' => $post->id,
                    'url' => $path,
                    'type' => 'image',
                    'caption' => null,
                ]);
            }
        }

        // 🏷️ Gắn tags
        if ($request->filled('tags')) {
            $tagNames = collect(explode(',', $request->tags))
                ->map(fn($t) => trim($t))
                ->filter()
                ->unique();

            $tagIds = [];
            foreach ($tagNames as $tagName) {
                $tag = \App\Models\Tag::firstOrCreate(
                    ['slug' => \Str::slug($tagName)],
                    ['name' => $tagName]
                );
                $tagIds[] = $tag->id;
            }

            $post->tags()->sync($tagIds);
        }

        return response()->json([
            'message' => '✅ Bài viết đã được tạo thành công!',
            'data' => $post->load('category', 'tags', 'media')
        ]);
    }

    // 🟠 Cập nhật bài viết
    public function update(Request $request, $id)
    {
        $post = Post::findOrFail($id);

        if ($post->user_id !== Auth::id() && !Auth::user()->hasRole('Super Admin')) {
            return response()->json(['message' => 'Bạn không có quyền sửa bài này'], 403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'content' => 'sometimes|string',
            'category_id' => 'sometimes|exists:categories,id',
            'thumbnail' => 'sometimes|image|max:5120',
            'images' => 'sometimes|array',
            'images.*' => 'image|max:5120',
        ]);

        // Cập nhật thumbnail nếu có
        if ($request->hasFile('thumbnail')) {
            // Xóa thumbnail cũ nếu tồn tại
            if ($post->thumbnail) {
                Storage::disk('public')->delete($post->thumbnail);
            }
            $validated['thumbnail'] = $request->file('thumbnail')->store('thumbnails', 'public');
        }

        $post->update($validated);

        // Thêm ảnh mới nếu có
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $path = $file->store('media', 'public');

                Media::create([
                    'post_id' => $post->id,
                    'url' => $path,
                    'type' => 'image',
                    'caption' => null,
                ]);
            }
        }

        if ($request->has('tags')) {
            $post->tags()->sync($request->tags);
        }

        return response()->json([
            'message' => 'Cập nhật bài viết thành công',
            'post' => $post->load('tags', 'media')
        ]);
    }

    // 🔴 Xóa ảnh từ media
    public function deleteMedia($id)
    {
        $media = Media::findOrFail($id);

        // Kiểm tra quyền
        $post = $media->post;
        if ($post->user_id !== Auth::id() && !Auth::user()->hasRole('Super Admin')) {
            return response()->json(['message' => 'Bạn không có quyền xóa ảnh này'], 403);
        }

        // Xóa file vật lý
        Storage::disk('public')->delete($media->url);

        // Xóa record
        $media->delete();

        return response()->json(['message' => 'Đã xóa ảnh']);
    }

    // 🔴 Xóa bài viết
    public function destroy($id)
    {
        $post = Post::findOrFail($id);

        if ($post->user_id !== Auth::id() && !Auth::user()->hasRole('Super Admin')) {
            return response()->json(['message' => 'Bạn không có quyền xóa bài này'], 403);
        }

        // Xóa thumbnail
        if ($post->thumbnail) {
            Storage::disk('public')->delete($post->thumbnail);
        }

        // Xóa media files
        foreach ($post->media as $media) {
            Storage::disk('public')->delete($media->url);
        }

        $post->delete();
        return response()->json(['message' => 'Đã xóa bài viết']);
    }

    // 🟣 Duyệt bài (Moderator/Admin)
    public function approve($id)
    {
        $post = Post::findOrFail($id);
        $post->update(['status' => 'approved']);

        return response()->json([
            'message' => 'Bài viết đã được duyệt thành công',
            'post' => $post
        ]);
    }

    public function getComments($id)
    {
        $comments = Comment::where('post_id', $id)
            ->whereNull('parent_id')
            ->with(['user', 'replies.user'])
            ->latest()
            ->get();

        return response()->json($comments);
    }

    public function addComment(Request $request, $id)
    {
        $validated = $request->validate(['content' => 'required|string']);
        $comment = \App\Models\Comment::create([
            'user_id' => $request->user()->id,
            'post_id' => $id,
            'content' => $validated['content'],
        ]);

        return response()->json($comment->load('user'));
    }

    public function replyComment(Request $request, $commentId)
    {
        $validated = $request->validate(['content' => 'required|string']);
        $parent = Comment::findOrFail($commentId);

        $reply = Comment::create([
            'user_id' => $request->user()->id,
            'post_id' => $parent->post_id,
            'parent_id' => $parent->id,
            'content' => $validated['content'],
        ]);

        return response()->json($reply->load('user'));
    }

}
