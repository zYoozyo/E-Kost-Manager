<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OwnerProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'nama_kost',
        'alamat',
        'kode_pos',
        'provinsi',
        'kota',
        'kecamatan',
        'kelurahan',
        'pilihan_pembayaran',
        'bank_name',
        'bank_account_number',
        'bank_account_holder',
        'qris_payload',
        'qris_image_path',
    ];

    protected $appends = ['qris_image_url'];

    public function getQrisImageUrlAttribute()
    {
        if (!$this->qris_image_path) {
            return null;
        }
        
        // Jika sudah full URL, return as is
        if (filter_var($this->qris_image_path, FILTER_VALIDATE_URL)) {
            return $this->qris_image_path;
        }
        
        // Jika relative path, generate URL
        return asset('storage/' . $this->qris_image_path);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
