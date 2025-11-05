<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    // 🟢 Lấy danh sách danh mục (Public - dùng cho frontend)
    public function index()
    {
        $categories = Category::select('id', 'name', 'slug')->orderBy('name')->get();

        return response()->json([
            'message' => 'Danh sách danh mục',
            'categories' => $categories
        ]);
    }

    // 🔵 (Tùy chọn) - Nếu muốn Super Admin quản lý danh mục
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
        ]);

        $category = Category::create([
            'name' => $request->name,
            'slug' => \Str::slug($request->name),
        ]);

        return response()->json(['message' => 'Đã thêm danh mục mới', 'category' => $category]);
    }
}
