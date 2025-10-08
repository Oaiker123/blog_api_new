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
        'website',
        'visibility',
    ];

    // 🔁 Quan hệ ngược về User
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
