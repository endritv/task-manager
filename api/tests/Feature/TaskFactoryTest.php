<?php

use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use App\Models\Task;

it('creates a task with default factory', function () {
    $task = Task::factory()->create();

    expect($task)->toBeInstanceOf(Task::class)
        ->and($task->title)->toBeString()
        ->and($task->status)->toBeInstanceOf(TaskStatus::class)
        ->and($task->priority)->toBeInstanceOf(TaskPriority::class);
});

it('creates a pending task', function () {
    $task = Task::factory()->pending()->create();

    expect($task->status)->toBe(TaskStatus::Pending);
});

it('creates a completed task', function () {
    $task = Task::factory()->completed()->create();

    expect($task->status)->toBe(TaskStatus::Completed);
});

it('creates a high priority task', function () {
    $task = Task::factory()->highPriority()->create();

    expect($task->priority)->toBe(TaskPriority::High);
});
