<?php

namespace App\Actions;

use App\Data\CreateTaskData;
use App\Models\Task;
use App\Services\TaskService;

final readonly class CreateTaskAction
{
    public function __construct(
        private TaskService $service,
    ) {}

    public function execute(CreateTaskData $data): Task
    {
        return $this->service->create($data);
    }
}
