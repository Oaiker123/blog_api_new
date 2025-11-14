<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'category_id', 'title', 'slug', 'excerpt', 'content',
        'thumbnail', 'status', 'views_count', 'likes_count'
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function category() {
        return $this->belongsTo(Category::class);
    }

    public function tags() {
        return $this->belongsToMany(Tag::class);
    }

    public function comments() {
        return $this->hasMany(Comment::class);
    }

    public function likes() {
        return $this->hasMany(Like::class);
    }

    public function media() {
        return $this->hasMany(Media::class);
    }

    public function bookmarks() {
        return $this->hasMany(Bookmark::class);
    }

    // Thêm vào Post model
    public function views()
    {
        return $this->hasMany(View::class);
    }

    public function getViewsCountAttribute()
    {
        return $this->views()->count();
    }
}
