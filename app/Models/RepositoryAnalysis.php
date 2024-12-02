<?php

// app/Models/RepositoryAnalysis.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class RepositoryAnalysis extends Model
{
    use HasFactory;

    protected $fillable = [
        'repository_id',
        'user_id',
        'content',
        'analysis'
    ];

    protected $casts = [
        'analysis' => 'array'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function repository()
    {
        return $this->belongsTo(Repository::class);
    }
}
