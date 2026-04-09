<?php

namespace App\Actions;

use App\DTO\CreateTaskData;
use App\Events\TaskCreated;
use App\Models\Task;
use App\Services\TaskService;
use Throwable;

final readonly class CreateTaskAction
{
    public function __construct(
        private TaskService $service,
    ) {}

    /**
     * @throws Throwable
     */
    public function execute(CreateTaskData $data): Task
    {
        $task = $this->service->create($data);

        TaskCreated::dispatch($task);

        return $task;
    }
}
