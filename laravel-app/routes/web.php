<?php

use App\Http\Controllers\QuizController;
use App\Http\Controllers\LeaderboardController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// ─── Halaman awal ──────────────────────────
Route::get('/', function () {
    return Inertia::render('Welcome');
})->name('home');

// ─── Halaman yang butuh login ───────────────
Route::middleware(['auth', 'verified'])->group(function () {

    // Dashboard - pilih kelas & mapel
    Route::get('/dashboard', [QuizController::class, 'dashboard'])
        ->name('dashboard');

    // Quiz
    Route::prefix('quiz')->name('quiz.')->group(function () {
        Route::post('/mulai',            [QuizController::class, 'start'])   ->name('start');
        Route::get('/arena/{token}',     [QuizController::class, 'arena'])   ->name('arena');
        Route::post('/jawab/{token}',    [QuizController::class, 'answer'])  ->name('answer');
        Route::post('/selesai/{token}',  [QuizController::class, 'complete'])->name('complete');
        Route::post('/keluar/{token}',   [QuizController::class, 'abandon']) ->name('abandon');
    });

    // Leaderboard
    Route::get('/leaderboard', [LeaderboardController::class, 'index'])
        ->name('leaderboard');

    // Profile (sudah ada dari Breeze)
    Route::get('/profile',    [ProfileController::class, 'edit'])   ->name('profile.edit');
    Route::patch('/profile',  [ProfileController::class, 'update']) ->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
