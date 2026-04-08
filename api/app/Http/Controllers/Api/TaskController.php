<?php

namespace App\Http\Controllers\Api;

use App\Actions\CreateTaskAction;
use App\Actions\UpdateTaskAction;
use App\Data\CreateTaskData;
use App\Data\UpdateTaskData;
use App\Http\Requests\CreateTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use App\Services\TaskService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Http\Response;

final class TaskController extends ApiController
{
    public function __construct(
        private readonly TaskService $service,
    ) {}

    public function index(Request $request): ResourceCollection
    {
        return $this->collection(
            TaskResource::collection(
                $this->service->list(
                    sortBy: $request->query('sort', 'created_at'),
                    direction: $request->query('direction', 'desc'),
                )
            )
        );
    }

    public function store(CreateTaskRequest $request, CreateTaskAction $action): JsonResponse
    {
        $task = $action->execute(CreateTaskData::fromRequest($request));

        return $this->created(new TaskResource($task));
    }

    public function show(Task $task): JsonResponse
    {
        return $this->success(new TaskResource($task));
    }

    public function update(UpdateTaskRequest $request, Task $task, UpdateTaskAction $action): JsonResponse
    {
        $updated = $action->execute($task, UpdateTaskData::fromRequest($request));

        return $this->success(new TaskResource($updated));
    }

    public function destroy(Task $task): Response
    {
        $task->delete();

        return $this->noContent();
    }

    public function stats(): JsonResponse
    {
        return $this->json($this->service->stats());
    }
}
