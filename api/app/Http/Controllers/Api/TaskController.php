<?php

namespace App\Http\Controllers\Api;

use App\Actions\CreateTaskAction;
use App\Actions\UpdateTaskAction;
use App\DTO\CreateTaskData;
use App\DTO\UpdateTaskData;
use App\Http\Requests\CreateTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use App\Services\TaskService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Http\Response;
use Throwable;

/**
 * @group Tasks
 *
 * APIs for managing tasks.
 */
final class TaskController extends ApiController
{
    public function __construct(
        private readonly TaskService $service,
    ) {}

    /**
     * List tasks
     *
     * Returns a paginated list of tasks with optional sorting.
     *
     * @queryParam sort string Sort field. Allowed: created_at, due_date, priority, status, title. Example: created_at
     * @queryParam direction string Sort direction. Allowed: asc, desc. Example: desc
     * @queryParam per_page integer Items per page (max 50). Example: 15
     */
    public function index(Request $request): ResourceCollection
    {
        return $this->collection(
            TaskResource::collection(
                $this->service->list(
                    sortBy: $request->query('sort', 'created_at'),
                    direction: $request->query('direction', 'desc'),
                    perPage: min((int) $request->query('per_page', 15), 50),
                )
            )
        );
    }

    /**
     * Create a task
     *
     * Creates a new task. Title is required, all other fields are optional with sensible defaults.
     *
     * @bodyParam title string required The task title. Max 100 characters. Example: Implement user auth
     * @bodyParam description string optional Task details. Max 500 characters. Example: Add JWT authentication
     * @bodyParam status string optional Task status. Allowed: pending, in_progress, completed. Example: pending
     * @bodyParam priority string optional Task priority. Allowed: low, medium, high. Example: high
     * @bodyParam due_date string optional Due date in Y-m-d format. Example: 2026-05-01
     *
     * @response 201 {"data":{"id":1,"title":"Implement user auth","description":"Add JWT authentication","status":"pending","priority":"high","dueDate":"2026-05-01T00:00:00+00:00","createdAt":"2026-04-08T00:00:00+00:00","updatedAt":"2026-04-08T00:00:00+00:00"}}
     */
    public function store(CreateTaskRequest $request, CreateTaskAction $action): JsonResponse
    {
        $task = $action->execute(CreateTaskData::fromRequest($request));

        return $this->created(new TaskResource($task));
    }

    /**
     * Get a task
     *
     * Returns a single task by ID.
     *
     * @urlParam task integer required The task ID. Example: 1
     *
     * @response 404 {"message":"Task not found"}
     */
    public function show(Task $task): JsonResponse
    {
        return $this->success(new TaskResource($task));
    }

    /**
     * Update a task
     *
     * Updates a task. Only send the fields you want to change.
     *
     * @urlParam task integer required The task ID. Example: 1
     * @bodyParam title string optional Updated title. Max 100 characters. Example: Updated title
     * @bodyParam status string optional Updated status. Allowed: pending, in_progress, completed. Example: completed
     * @bodyParam priority string optional Updated priority. Allowed: low, medium, high. Example: low
     */
    public function update(UpdateTaskRequest $request, Task $task, UpdateTaskAction $action): JsonResponse
    {
        $updated = $action->execute($task, UpdateTaskData::fromRequest($request));

        return $this->success(new TaskResource($updated));
    }

    /**
     * Delete a task
     *
     * Permanently deletes a task.
     *
     * @urlParam task integer required The task ID. Example: 1
     *
     * @response 204 {}
     * @response 404 {"message":"Task not found"}
     *
     * @throws Throwable
     */
    public function destroy(Task $task): Response
    {
        $this->service->delete($task);

        return $this->noContent();
    }

    /**
     * Get task statistics
     *
     * Returns task counts grouped by status and priority.
     *
     * @response {"total":10,"byStatus":{"pending":5,"in_progress":3,"completed":2},"byPriority":{"low":3,"medium":4,"high":3}}
     */
    public function stats(): JsonResponse
    {
        return $this->json($this->service->stats());
    }
}
