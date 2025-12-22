<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Kamar extends Model
{
    use HasFactory;

    protected $table = 'kamars';

    protected $fillable = [
        'kost_id',
        'tenant_id',
        'tanggal_mulai_sewa',
        'durasi_sewa',
        'tanggal_akhir_sewa',
        'catatan_sewa',
        'nomor_kamar',
        'tipe_kamar',
        'harga_sewa',
        'status',
    ];

    protected $casts = [
        'tanggal_mulai_sewa' => 'date',
        'tanggal_akhir_sewa' => 'date',
        'harga_sewa' => 'integer',
    ];

    public function kost()
    {
        return $this->belongsTo(Kost::class);
    }

    public function tenant()
    {
        return $this->belongsTo(User::class, 'tenant_id');
    }
}
