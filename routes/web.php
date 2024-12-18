<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Auth\SocialLoginController;
use App\Http\Controllers\RepositoryAnalysisController;
use App\Http\Controllers\MetricsController;
use App\Http\Controllers\RepositoryStatsController;
use App\Http\Controllers\PRAnalysisController;
use App\Http\Controllers\ContributorAnalysisController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

Route::get('/', function () {
    if (Auth::check()) {
        return redirect('/dashboard');
    }
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
})->name('home');

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

Route::get('/{branch}/stats', [RepositoryAnalysisController::class, 'showBranchStats'])
    ->middleware(['auth'])
    ->name('branch.stats');

Route::get('/overview-stats', [RepositoryStatsController::class, 'index'])
    ->middleware(['auth'])
    ->name('overview.stats');

Route::get('/api/repository-stats', [RepositoryStatsController::class, 'getStats'])
    ->middleware(['auth'])
    ->name('api.repository-stats');

Route::middleware(['auth'])->group(function () {
    Route::get('/pr-analysis', [PRAnalysisController::class, 'index'])->name('pr.analysis');
    Route::get('/api/pull-requests', [PRAnalysisController::class, 'getPullRequests']);
    Route::post('/api/analyze-pr/{prNumber}', [PRAnalysisController::class, 'analyzePR']);
    Route::get('/contributors', [ContributorAnalysisController::class, 'index'])->name('contributors');
    Route::get('/api/contributors', [ContributorAnalysisController::class, 'getContributors']);
    Route::post('/api/analyze-contributor/{username}', [ContributorAnalysisController::class, 'analyzeContributor']);
});

require __DIR__ . '/auth.php';
