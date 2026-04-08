<?php

namespace App\Actions;

use App\Data\UpdateTaskData;
use App\Models\Task;
use App\Services\TaskService;

final readonly class UpdateTaskAction
{
    public function __construct(
        private TaskService $service,
    ) {}

    public function execute(Task $task, UpdateTaskData $data): Task
    {
        return $this->service->update($task, $data);
    }
}
