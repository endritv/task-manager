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
                'title' => $data->title,
                'description' => $data->description,
                'status' => $data->status,
                'priority' => $data->priority,
                'due_date' => $data->dueDate,
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
                'title' => $data->title,
                'description' => $data->description,
                'status' => $data->status,
                'priority' => $data->priority,
                'due_date' => $data->dueDate,
            ], fn ($value) => $value !== null);

            $task->update($fields);

            Log::info('Task updated', ['id' => $task->id, 'fields' => array_keys($fields)]);

            return $task->fresh();
        } catch (Throwable $e) {
            Log::error('Failed to update task', [
                'id' => $task->id,
                'error' => $e->getMessage(),
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
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    public function list(
        string $sortBy = 'created_at',
        string $direction = 'desc',
        int $perPage = 15,
        ?string $search = null,
        ?string $status = null,
        ?string $priority = null,
    ): LengthAwarePaginator {
        $query = Task::query();

        if ($search !== null && $search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'ilike', "%{$search}%")
                    ->orWhere('description', 'ilike', "%{$search}%");
            });
        }

        if ($status !== null && $status !== '') {
            $query->where('status', $status);
        }

        if ($priority !== null && $priority !== '') {
            $query->where('priority', $priority);
        }

        $sortField = in_array($sortBy, self::ALLOWED_SORTS) ? $sortBy : 'created_at';
        $sortDir = $direction === 'asc' ? 'asc' : 'desc';

        if ($sortField === 'priority') {
            $query->orderByRaw("CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END {$sortDir}");
        } elseif ($sortField === 'status') {
            $query->orderByRaw("CASE status WHEN 'in_progress' THEN 1 WHEN 'pending' THEN 2 WHEN 'completed' THEN 3 END {$sortDir}");
        } else {
            $query->orderBy($sortField, $sortDir);
        }

        return $query->paginate($perPage);
    }

    public function stats(): array
    {
        return [
            'totalTasks' => Task::count(),
            'byStatus' => Task::selectRaw('status, count(*) as count')
                ->groupBy('status')
                ->pluck('count', 'status'),
            'byPriority' => Task::selectRaw('priority, count(*) as count')
                ->groupBy('priority')
                ->pluck('count', 'priority'),
        ];
    }
}
