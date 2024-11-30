<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Auth\SocialLoginController;
use App\Http\Controllers\RepositoryAnalysisController;
use App\Http\Controllers\MetricsController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', [DashboardController::class, 'show'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});


Route::get('/auth/github', [SocialLoginController::class, 'redirectToProvider'])->name('login.github');
Route::get('/auth/github/callback', [SocialLoginController::class, 'handleProviderCallback']);

Route::post('/analyze', [RepositoryAnalysisController::class, 'analyze'])
    ->middleware(['auth'])
    ->name('repository.analyze');
Route::get('/analysis/{analysis}', [RepositoryAnalysisController::class, 'show']);

Route::get('/metrics', [MetricsController::class, 'index'])
    ->middleware(['auth'])
    ->name('metrics');

require __DIR__ . '/auth.php';