<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pembayaran extends Model
{
    use HasFactory;

    public const STATUS_PENDING = 'pending';
    public const STATUS_WAITING_VERIFICATION = 'waiting_verification';
    public const STATUS_PAID = 'paid';
    public const STATUS_LATE = 'late';
    public const STATUS_REJECTED = 'rejected';

    protected $table = 'pembayaran';
    
    protected $fillable = [
        'invoice_code',
        'owner_id',
        'tenant_id',
        'kamar_id',
        'periode_mulai',
        'periode_selesai',
        'due_date',
        'nominal_tagihan',
        'nominal_dibayar',
        'metode_pembayaran',
        'status',
        'bukti_pembayaran_path',
        'catatan',
        'paid_at',
    ];

    protected $casts = [
        'periode_mulai' => 'date',
        'periode_selesai' => 'date',
        'due_date' => 'date',
        'paid_at' => 'datetime',
    ];

    protected $appends = ['bukti_pembayaran_url'];

    public function getBuktiPembayaranUrlAttribute()
    {
        if ($this->bukti_pembayaran_path) {
            return asset('storage/' . $this->bukti_pembayaran_path);
        }
        return null;
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function tenant()
    {
        return $this->belongsTo(User::class, 'tenant_id');
    }

    public function kamar()
    {
        return $this->belongsTo(Kamar::class);
    }

    public function scopeForOwner($query, int $ownerId)
    {
        return $query->where('owner_id', $ownerId);
    }

    public function markAsPaid(?int $amount = null): void
    {
        $this->status = self::STATUS_PAID;
        $this->paid_at = now();
        if ($amount !== null) {
            $this->nominal_dibayar = $amount;
        }
        $this->save();
    }
}
