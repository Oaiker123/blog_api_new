<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;
    use HasRoles {
        HasRoles::hasPermissionTo as protected spatieHasPermissionTo;
    }

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

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'blocked_permissions' => 'array',
    ];

    protected $guard_name = 'web';

    // ⚡ Ghi đè hasPermissionTo — kiểm tra blocked trước
    public function hasPermissionTo($permission, $guardName = null): bool
    {
        // Nếu quyền bị chặn → từ chối luôn
        if (in_array($permission, $this->blocked_permissions ?? [])) {
            return false;
        }

        // Gọi lại bản gốc của Spatie
        return $this->spatieHasPermissionTo($permission, $guardName);
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

    // ✅ Gỡ chặn quyền
    public function unblockPermission(string $permission)
    {
        $blocked = $this->blocked_permissions ?? [];
        $this->blocked_permissions = array_values(array_diff($blocked, [$permission]));
        $this->save();
    }
}
