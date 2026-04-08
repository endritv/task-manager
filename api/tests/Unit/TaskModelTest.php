<?php

use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use App\Models\Task;

it('has the expected fillable attributes', function () {
    $task = new Task;

    expect($task->getFillable())->toBe([
        'title',
        'description',
        'status',
        'priority',
        'due_date',
    ]);
});

it('casts status to TaskStatus enum', function () {
    $task = new Task;
    $casts = $task->getCasts();

    expect($casts['status'])->toBe(TaskStatus::class);
});

it('casts priority to TaskPriority enum', function () {
    $task = new Task;
    $casts = $task->getCasts();

    expect($casts['priority'])->toBe(TaskPriority::class);
});

it('casts due_date to datetime', function () {
    $task = new Task;
    $casts = $task->getCasts();

    expect($casts['due_date'])->toBe('datetime');
});
