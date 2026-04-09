<?php

namespace App\Actions;

use App\Events\TaskDeleted;
use App\Models\Task;
use App\Services\TaskService;
use Throwable;

final readonly class DeleteTaskAction
{
    public function __construct(
        private TaskService $service,
    ) {}

    /**
     * @throws Throwable
     */
    public function execute(Task $task): void
    {
        $id = $task->id;
        $title = $task->title;

        $this->service->delete($task);

        TaskDeleted::dispatch($id, $title);
    }
}
