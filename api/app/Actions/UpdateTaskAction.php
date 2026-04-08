<?php

namespace App\Actions;

use App\DTO\UpdateTaskData;
use App\Models\Task;
use App\Services\TaskService;
use Throwable;

final readonly class UpdateTaskAction
{
    public function __construct(
        private TaskService $service,
    ) {}

    /**
     * @throws Throwable
     */
    public function execute(Task $task, UpdateTaskData $data): Task
    {
        return $this->service->update($task, $data);
    }
}
