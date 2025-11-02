<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Kamar extends Model
{
    use HasFactory;

    protected $table = 'kamar';

    protected $fillable = [
        'nomor_kamar',
        'tipe_kamar',
        'harga_sewa',
        'status',
    ];

    public function pembayarans()
    {
        return $this->hasMany(pembayaran::class, 'kamar_id');
    }

    public function complaints()
    {
        return $this->hasMany(Complaint::class, 'kamar_id');
    }
}