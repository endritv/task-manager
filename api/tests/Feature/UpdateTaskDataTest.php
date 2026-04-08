<?php

use App\DTO\UpdateTaskData;
use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use App\Http\Requests\UpdateTaskRequest;

it('maps only provided fields', function () {
    $request = UpdateTaskRequest::create('/api/tasks/1', 'PUT', [
        'status' => TaskStatus::Completed->value,
    ]);

    $request->setContainer(app())
        ->setRedirector(app('redirect'))
        ->validateResolved();

    $dto = UpdateTaskData::fromRequest($request);

    expect($dto->status)->toBe(TaskStatus::Completed)
        ->and($dto->title)->toBeNull()
        ->and($dto->description)->toBeNull()
        ->and($dto->priority)->toBeNull()
        ->and($dto->dueDate)->toBeNull();
});

it('maps all fields when provided', function () {
    $request = UpdateTaskRequest::create('/api/tasks/1', 'PUT', [
        'title' => 'Updated title',
        'description' => 'Updated desc',
        'status' => TaskStatus::InProgress->value,
        'priority' => TaskPriority::Low->value,
        'due_date' => '2026-06-15',
    ]);

    $request->setContainer(app())
        ->setRedirector(app('redirect'))
        ->validateResolved();

    $dto = UpdateTaskData::fromRequest($request);

    expect($dto->title)->toBe('Updated title')
        ->and($dto->description)->toBe('Updated desc')
        ->and($dto->status)->toBe(TaskStatus::InProgress)
        ->and($dto->priority)->toBe(TaskPriority::Low)
        ->and($dto->dueDate->format('Y-m-d'))->toBe('2026-06-15');
});
