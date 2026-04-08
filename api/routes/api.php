<?php

use App\Http\Controllers\Api\TaskController;
use Illuminate\Support\Facades\Route;

Route::get('health', fn () => response()->json(['status' => 'ok']))->name('health');

Route::get('tasks/stats', [TaskController::class, 'stats'])->name('tasks.stats');

Route::apiResource('tasks', TaskController::class);
