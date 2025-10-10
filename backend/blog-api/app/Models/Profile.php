<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Profile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'username',
        'display_name',
        'bio',
        'avatar_path',
        'cover_path',
        'location',
        'birthdate',
        'gender',
        'phone',
        'website',
        'social_links',
        'visibility',
        'is_verified',
    ];

    // ✅ Tự parse JSON sang object/array khi trả về
    protected $casts = [
        'social_links' => 'array',
        'birthdate' => 'date:Y-m-d', // format lưu vào DB
        'is_verified' => 'boolean',
    ];

    // ✅ Format khi trả JSON
    protected function serializeDate(\DateTimeInterface $date)
    {
        return $date->format('d/m/Y'); // định dạng khi hiển thị ra API
    }

    // 🔁 Quan hệ ngược về User
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
