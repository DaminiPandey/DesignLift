<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class MetricsController extends Controller
{
    public function index()
    {
        return Inertia::render('Metrics/Index');
    }
} 