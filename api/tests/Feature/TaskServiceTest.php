<?php

use App\DTO\CreateTaskData;
use App\DTO\UpdateTaskData;
use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use App\Models\Task;
use App\Services\TaskService;
use Illuminate\Support\Facades\Log;

beforeEach(function () {
    $this->service = app(TaskService::class);
});

it('creates a task from DTO', function () {
    $dto = new CreateTaskData(
        title: 'Service test',
        description: 'Testing service layer',
        status: TaskStatus::Pending,
        priority: TaskPriority::High,
        dueDate: null,
    );

    $task = $this->service->create($dto);

    expect($task)->toBeInstanceOf(Task::class)
        ->and($task->title)->toBe('Service test')
        ->and($task->status)->toBe(TaskStatus::Pending)
        ->and($task->priority)->toBe(TaskPriority::High);
});

it('logs info when a task is created', function () {
    Log::spy();

    $dto = new CreateTaskData(
        title: 'Log test',
        description: null,
        status: TaskStatus::Pending,
        priority: TaskPriority::Medium,
        dueDate: null,
    );

    $this->service->create($dto);

    Log::shouldHaveReceived('info')
        ->withArgs(fn (string $message, array $context) => $message === 'Task created' && $context['title'] === 'Log test'
        )
        ->once();
});

it('logs info when a task is updated', function () {
    Log::spy();

    $task = Task::factory()->create(['title' => 'Original']);
    $dto = new UpdateTaskData(title: 'Updated', description: null, status: null, priority: null, dueDate: null);

    $this->service->update($task, $dto);

    Log::shouldHaveReceived('info')
        ->withArgs(fn (string $message, array $context) => $message === 'Task updated' && in_array('title', $context['fields'])
        )
        ->once();
});

it('logs info when a task is deleted', function () {
    Log::spy();

    $task = Task::factory()->create(['title' => 'Delete me']);

    $this->service->delete($task);

    Log::shouldHaveReceived('info')
        ->withArgs(fn (string $message, array $context) => $message === 'Task deleted' && $context['title'] === 'Delete me'
        )
        ->once();
});

it('logs error and re-throws on create failure', function () {
    Log::spy();

    // Force Task::create to throw by mocking the model
    Task::creating(function () {
        throw new RuntimeException('DB connection lost');
    });

    $dto = new CreateTaskData(
        title: 'Will fail',
        description: null,
        status: TaskStatus::Pending,
        priority: TaskPriority::Medium,
        dueDate: null,
    );

    expect(fn () => $this->service->create($dto))
        ->toThrow(RuntimeException::class, 'DB connection lost');

    Log::shouldHaveReceived('error')
        ->withArgs(fn (string $message, array $context) => $message === 'Failed to create task'
            && str_contains($context['error'], 'DB connection lost')
        )
        ->once();
});

it('logs error and re-throws on update failure', function () {
    Log::spy();

    $task = Task::factory()->create();

    Task::updating(function () {
        throw new RuntimeException('Update failed');
    });

    $dto = new UpdateTaskData(title: 'Will fail', description: null, status: null, priority: null, dueDate: null);

    expect(fn () => $this->service->update($task, $dto))
        ->toThrow(RuntimeException::class, 'Update failed');

    Log::shouldHaveReceived('error')
        ->withArgs(fn (string $message, array $context) => $message === 'Failed to update task'
            && str_contains($context['error'], 'Update failed')
        )
        ->once();
});

it('logs error and re-throws on delete failure', function () {
    Log::spy();

    $task = Task::factory()->create();

    // Force delete to throw
    Task::deleting(function () {
        throw new RuntimeException('Delete failed');
    });

    expect(fn () => $this->service->delete($task))
        ->toThrow(RuntimeException::class, 'Delete failed');

    Log::shouldHaveReceived('error')
        ->withArgs(fn (string $message, array $context) => $message === 'Failed to delete task'
            && str_contains($context['error'], 'Delete failed')
        )
        ->once();
});

it('lists tasks sorted by an allowed field', function () {
    Task::factory()->create(['title' => 'Banana']);
    Task::factory()->create(['title' => 'Apple']);
    Task::factory()->create(['title' => 'Cherry']);

    $result = $this->service->list(sortBy: 'title', direction: 'asc');

    expect($result)->toHaveCount(3)
        ->and($result->first()->title)->toBe('Apple')
        ->and($result->last()->title)->toBe('Cherry');
});

it('falls back to created_at desc for invalid sort fields', function () {
    $this->travel(-1)->days();
    Task::factory()->create(['title' => 'Old']);
    $this->travelBack();
    Task::factory()->create(['title' => 'New']);

    $result = $this->service->list(sortBy: 'password');

    expect($result)->toHaveCount(2)
        ->and($result->first()->title)->toBe('New')
        ->and($result->last()->title)->toBe('Old');
});

it('returns correct stats', function () {
    Task::factory()->count(2)->create(['status' => TaskStatus::Pending, 'priority' => TaskPriority::High]);
    Task::factory()->create(['status' => TaskStatus::Completed, 'priority' => TaskPriority::Low]);

    $stats = $this->service->stats();

    expect($stats['totalTasks'])->toBe(3)
        ->and($stats['byStatus'][TaskStatus::Pending->value])->toBe(2)
        ->and($stats['byStatus'][TaskStatus::Completed->value])->toBe(1)
        ->and($stats['byPriority'][TaskPriority::High->value])->toBe(2)
        ->and($stats['byPriority'][TaskPriority::Low->value])->toBe(1);
});

it('respects per page parameter', function () {
    Task::factory()->count(20)->create();

    $result = $this->service->list(perPage: 5);

    expect($result)->toHaveCount(5)
        ->and($result->lastPage())->toBe(4);
});
