<?php

use App\DTO\CreateTaskData;
use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use App\Http\Requests\CreateTaskRequest;

it('maps request fields to DTO properties', function () {
    $request = CreateTaskRequest::create('/api/tasks', 'POST', [
        'title' => 'My task',
        'description' => 'Some details',
        'status' => TaskStatus::InProgress->value,
        'priority' => TaskPriority::High->value,
        'due_date' => '2026-05-01',
    ]);

    $request->setContainer(app())
        ->setRedirector(app('redirect'))
        ->validateResolved();

    $dto = CreateTaskData::fromRequest($request);

    expect($dto->title)->toBe('My task')
        ->and($dto->description)->toBe('Some details')
        ->and($dto->status)->toBe(TaskStatus::InProgress)
        ->and($dto->priority)->toBe(TaskPriority::High)
        ->and($dto->dueDate->format('Y-m-d'))->toBe('2026-05-01');
});

it('defaults status to pending and priority to medium', function () {
    $request = CreateTaskRequest::create('/api/tasks', 'POST', [
        'title' => 'Minimal task',
    ]);

    $request->setContainer(app())
        ->setRedirector(app('redirect'))
        ->validateResolved();

    $dto = CreateTaskData::fromRequest($request);

    expect($dto->status)->toBe(TaskStatus::Pending)
        ->and($dto->priority)->toBe(TaskPriority::Medium)
        ->and($dto->description)->toBeNull()
        ->and($dto->dueDate)->toBeNull();
});
