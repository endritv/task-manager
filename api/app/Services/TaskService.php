<?php

namespace App\Services;

use App\DTO\CreateTaskData;
use App\DTO\UpdateTaskData;
use App\Models\Task;
use Illuminate\Pagination\LengthAwarePaginator;

final class TaskService
{
    private const array ALLOWED_SORTS = ['created_at', 'due_date', 'priority', 'status', 'title'];

    public function create(CreateTaskData $data): Task
    {
        return Task::create([
            'title'       => $data->title,
            'description' => $data->description,
            'status'      => $data->status,
            'priority'    => $data->priority,
            'due_date'    => $data->dueDate,
        ]);
    }

    public function update(Task $task, UpdateTaskData $data): Task
    {
        $fields = array_filter([
            'title'       => $data->title,
            'description' => $data->description,
            'status'      => $data->status,
            'priority'    => $data->priority,
            'due_date'    => $data->dueDate,
        ], fn($value) => $value !== null);

        $task->update($fields);

        return $task->fresh();
    }

    public function list(
        string $sortBy = 'created_at',
        string $direction = 'desc',
        int $perPage = 15,
    ): LengthAwarePaginator {
        return Task::orderBy(in_array($sortBy, self::ALLOWED_SORTS)
            ? $sortBy
            : 'created_at',
            $direction === 'asc' ? 'asc' : 'desc',
        )->paginate($perPage);
    }

    public function stats(): array
    {
        return [
            'total'      => Task::count(),
            'byStatus'   => Task::selectRaw('status, count(*) as count')
                ->groupBy('status')
                ->pluck('count', 'status'),
            'byPriority' => Task::selectRaw('priority, count(*) as count')
                ->groupBy('priority')
                ->pluck('count', 'priority'),
        ];
    }
}
