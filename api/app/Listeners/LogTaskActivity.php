<?php

namespace App\Listeners;

use App\Events\TaskCreated;
use App\Events\TaskDeleted;
use App\Events\TaskUpdated;
use Illuminate\Support\Facades\Log;

class LogTaskActivity
{
    public function handleCreated(TaskCreated $event): void
    {
        Log::channel('api')->info('Task created', [
            'task_id' => $event->task->id,
            'title' => $event->task->title,
        ]);
    }

    public function handleUpdated(TaskUpdated $event): void
    {
        Log::channel('api')->info('Task updated', [
            'task_id' => $event->task->id,
            'title' => $event->task->title,
        ]);
    }

    public function handleDeleted(TaskDeleted $event): void
    {
        Log::channel('api')->info('Task deleted', [
            'task_id' => $event->taskId,
            'title' => $event->title,
        ]);
    }
}
