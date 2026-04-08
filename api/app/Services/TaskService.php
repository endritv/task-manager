<?php

namespace App\Services;

use App\DTO\CreateTaskData;
use App\DTO\UpdateTaskData;
use App\Models\Task;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Log;
use Throwable;

final class TaskService
{
    private const array ALLOWED_SORTS = ['created_at', 'due_date', 'priority', 'status', 'title'];

    /**
     * @throws Throwable
     */
    public function create(CreateTaskData $data): Task
    {
        try {
            $task = Task::create([
                'title'       => $data->title,
                'description' => $data->description,
                'status'      => $data->status,
                'priority'    => $data->priority,
                'due_date'    => $data->dueDate,
            ]);

            Log::info('Task created', ['id' => $task->id, 'title' => $task->title]);

            return $task;
        } catch (Throwable $e) {
            Log::error('Failed to create task', ['error' => $e->getMessage(), 'title' => $data->title]);
            throw $e;
        }
    }

    /**
     * @throws Throwable
     */
    public function update(Task $task, UpdateTaskData $data): Task
    {
        try {
            $fields = array_filter([
                'title'       => $data->title,
                'description' => $data->description,
                'status'      => $data->status,
                'priority'    => $data->priority,
                'due_date'    => $data->dueDate,
            ], fn ($value) => $value !== null);

            $task->update($fields);

            Log::info('Task updated', ['id' => $task->id, 'fields' => array_keys($fields)]);

            return $task->fresh();
        } catch (Throwable $e) {
            Log::error('Failed to update task', [
                'id' => $task->id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * @throws Throwable
     */
    public function delete(Task $task): void
    {
        try {
            $id = $task->id;
            $title = $task->title;

            $task->delete();
            Log::info('Task deleted', ['id' => $id, 'title' => $title]);
        } catch (Throwable $e) {
            Log::error('Failed to delete task', [
                'id' => $task->id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    public function list(
        string $sortBy = 'created_at',
        string $direction = 'desc',
        int $perPage = 15,
    ): LengthAwarePaginator {
        return Task::orderBy(
            in_array($sortBy, self::ALLOWED_SORTS) ? $sortBy : 'created_at',
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
