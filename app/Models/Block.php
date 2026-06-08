<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Block extends Model
{
    use HasFactory;

    protected $table = 'bloqueios';

    protected $fillable = [
        'appointment_id',
        'start_time',
        'finish_time',
        'label',
    ];

    protected function casts(): array
    {
        return [
            'start_time' => 'datetime',
            'finish_time' => 'datetime',
        ];
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }
}
