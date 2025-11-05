<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use App\Models\Category;
use App\Models\Tag;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Công nghệ', 'description' => 'Tin tức và xu hướng công nghệ mới nhất', 'icon' => 'cpu'],
            ['name' => 'Lập trình', 'description' => 'Kiến thức và hướng dẫn về lập trình', 'icon' => 'code'],
            ['name' => 'Kinh doanh', 'description' => 'Chia sẻ về khởi nghiệp và quản lý doanh nghiệp', 'icon' => 'briefcase'],
            ['name' => 'Đời sống', 'description' => 'Các câu chuyện và chủ đề xoay quanh cuộc sống hàng ngày', 'icon' => 'heart'],
            ['name' => 'Giải trí', 'description' => 'Tin tức âm nhạc, phim ảnh, nghệ thuật', 'icon' => 'music'],
            ['name' => 'Thể thao', 'description' => 'Cập nhật tin tức và phân tích thể thao', 'icon' => 'activity'],
        ];

        foreach ($categories as $cat) {
            Category::updateOrCreate(
                ['slug' => Str::slug($cat['name'])],
                [
                    'name' => $cat['name'],
                    'description' => $cat['description'],
                    'icon' => $cat['icon'] ?? null,
                ]
            );
        }

        $tags = [
            'AI',
            'Công nghệ mới',
            'Startup',
            'PHP',
            'JavaScript',
            'Laravel',
            'React',
            'Kinh doanh online',
            'Thể thao',
            'Giải trí'
        ];

        foreach ($tags as $tagName) {
            Tag::updateOrCreate(
                ['slug' => Str::slug($tagName)],
                ['name' => $tagName]
            );
        }

        $this->command->info('✅ Danh mục bài viết đã được tạo hoặc cập nhật thành công!');
    }
}
