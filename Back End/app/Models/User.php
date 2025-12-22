<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'role',
        'phone',
        'whatsapp',
        'address',
        'avatar',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        // 'password' => 'hashed', // Removed - using mutator instead for better control
    ];

    protected $appends = ['avatar_url'];

    /**
     * Mutator untuk password - hash password saat disimpan
     */
    public function setPasswordAttribute($value)
    {
        // Jika password kosong, jangan set
        if (empty($value)) {
            return;
        }
        
        // Jika password sudah di-hash (panjang 60 dan dimulai dengan $2y$), simpan langsung
        // Jika belum, hash dulu
        if (strlen($value) == 60 && substr($value, 0, 4) === '$2y$') {
            // Password sudah di-hash, simpan langsung
            $this->attributes['password'] = $value;
        } else {
            // Password masih plain, hash dulu
            $this->attributes['password'] = Hash::make($value);
        }
    }

    public function getAvatarUrlAttribute()
    {
        if ($this->avatar) {
            // Jika avatar sudah URL lengkap (dimulai dengan http:// atau https://)
            // Extract path relatif dan generate URL baru
            if (str_starts_with($this->avatar, 'http://') || str_starts_with($this->avatar, 'https://')) {
                // Extract path dari URL lengkap
                // Format: http://localhost:8000/storage/avatars/xxx.jpg
                // Menjadi: avatars/xxx.jpg
                $path = preg_replace('#^https?://[^/]+/storage/#', '', $this->avatar);
                $path = preg_replace('#^storage/#', '', $path);
                
                // Jika berhasil extract path, gunakan path tersebut
                if ($path && $path !== $this->avatar) {
                    // Update database dengan path relatif (async, tidak blocking)
                    // Tapi untuk sekarang, generate URL dari path yang sudah di-extract
                    return asset('storage/' . $path);
                }
                
                // Jika tidak bisa extract, kembalikan URL asli (fallback)
                return $this->avatar;
            }
            // Jika masih path relatif, tambahkan asset()
            return asset('storage/' . $this->avatar);
        }
        return null;
    }

    // Relationship
    public function ownerProfile()
    {
        return $this->hasOne(OwnerProfile::class);
    }

    // Alias untuk backward compatibility
    public function adminProfile()
    {
        return $this->ownerProfile();
    }

    public function kosts()
    {
        return $this->hasMany(Kost::class);
    }

    public function tenantRooms()
    {
        return $this->hasMany(Kamar::class, 'tenant_id');
    }
}
