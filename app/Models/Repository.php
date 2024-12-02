<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Repository extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'full_name',
        'github_id',
        'user_id',
        'description',
        'url'
    ];

    protected $casts = [
        'github_id' => 'string', // Since GitHub IDs can be large numbers
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function analyses()
    {
        return $this->hasMany(RepositoryAnalysis::class);
    }
} 