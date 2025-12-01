<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Complaint extends Model
{
    use HasFactory;

    const STATUS_PENDING = 'pending';
    const STATUS_IN_PROGRESS = 'in_progress';
    const STATUS_RESOLVED = 'resolved';

    const PRIORITY_LOW = 'low';
    const PRIORITY_MEDIUM = 'medium';
    const PRIORITY_HIGH = 'high';

    protected $fillable = [
        'tenant_id',
        'kost_id',
        'title',
        'description',
        'status',
        'priority',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $with = ['tenant', 'responses'];
    

    public function tenant()
    {
        return $this->belongsTo(User::class, 'tenant_id');
    }

    public function kost()
    {
        return $this->belongsTo(Kost::class);
    }

    public function responses()
    {
        return $this->hasMany(ComplaintResponse::class)->latest();
    }

    public function addResponse($data, $userId, $isOwner = false)
    {
        return $this->responses()->create([
            'user_id' => $userId,
            'message' => $data['message'],
            'is_owner_response' => $isOwner,
        ]);
    }

    public function scopeForTenant($query, $tenantId)
    {
        return $query->where('tenant_id', $tenantId);
    }

    public function scopeForKost($query, $kostId)
    {
        return $query->where('kost_id', $kostId);
    }
}
