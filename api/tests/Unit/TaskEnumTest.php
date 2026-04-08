<?php

use App\Enums\TaskPriority;
use App\Enums\TaskStatus;

it('has correct status values', function () {
    expect(TaskStatus::Pending->value)->toBe('pending')
        ->and(TaskStatus::InProgress->value)->toBe('in_progress')
        ->and(TaskStatus::Completed->value)->toBe('completed');
});

it('has correct priority values', function () {
    expect(TaskPriority::Low->value)->toBe('low')
        ->and(TaskPriority::Medium->value)->toBe('medium')
        ->and(TaskPriority::High->value)->toBe('high');
});

it('creates status from valid string', function () {
    expect(TaskStatus::from('in_progress'))->toBe(TaskStatus::InProgress);
});

it('creates priority from valid string', function () {
    expect(TaskPriority::from('high'))->toBe(TaskPriority::High);
});

it('throws on invalid status', function () {
    TaskStatus::from('invalid');
})->throws(ValueError::class);

it('throws on invalid priority', function () {
    TaskPriority::from('urgent');
})->throws(ValueError::class);

it('returns null for invalid status via tryFrom', function () {
    expect(TaskStatus::tryFrom('invalid'))->toBeNull();
});

it('returns null for invalid priority via tryFrom', function () {
    expect(TaskPriority::tryFrom('urgent'))->toBeNull();
});
