<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'otp_code',
        'otp_expires_at',
        'otp_sent_at',
        'is_verified',
        'blocked_permissions',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'blocked_permissions' => 'array',
    ];

    public function profile()
    {
        return $this->hasOne(Profile::class);
    }

    // public function permissions()
    // {
    //     return $this->belongsToMany(\Spatie\Permission\Models\Permission::class, 'model_has_permissions', 'model_id', 'permission_id');
    // }

    protected $guard_name = 'web';

    // ⚡ Kiểm tra quyền (ghi đè mặc định)
    public function hasPermissionTo($permission, $guardName = null): bool
    {
        // Nếu quyền nằm trong blocked_permissions thì từ chối luôn
        if (in_array($permission, $this->blocked_permissions ?? [])) {
            return false;
        }

        // Ngược lại, dùng Spatie mặc định
        return parent::hasPermissionTo($permission, $guardName);
    }

    // 🚫 Thêm quyền bị chặn
    public function blockPermission(string $permission)
    {
        $blocked = $this->blocked_permissions ?? [];
        if (!in_array($permission, $blocked)) {
            $blocked[] = $permission;
            $this->blocked_permissions = $blocked;
            $this->save();
        }
    }

    // ✅ Gỡ bỏ chặn
    public function unblockPermission(string $permission)
    {
        $blocked = $this->blocked_permissions ?? [];
        $this->blocked_permissions = array_values(array_diff($blocked, [$permission]));
        $this->save();
    }
}
