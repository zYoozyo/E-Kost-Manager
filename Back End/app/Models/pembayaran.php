<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class pembayaran extends Model
{
    protected $fillable = [
        'user_id',
        'kamar_id',
        'jumlah',
        'tanggal_bayar',
        'tanggal_jatuh_tempo',
        'status',
        'metode_pembayaran',
        'keterangan',
    ];

    protected $casts = [
        'tanggal_bayar' => 'date',
        'tanggal_jatuh_tempo' => 'date',
        'jumlah' => 'decimal:2',
    ];

    // Disable auto model binding by ID
    public function getRouteKeyName()
    {
        return 'id';
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function kamar()
    {
        return $this->belongsTo(Kamar::class);
    }
}
