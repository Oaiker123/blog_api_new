<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Media extends Model
{
    use HasFactory;

    protected $fillable = [
        'post_id',
        'comment_id', // 👈 THÊM VÀO ĐÂY
        'type',
        'url',
        'caption'
    ];

    public function post() {
        return $this->belongsTo(Post::class);
    }


    public function comment()
    {
        return $this->belongsTo(Comment::class);
    }

    // Helper method để lấy model cha
    public function parent()
    {
        return $this->post_id ? $this->post : $this->comment;
    }
}
