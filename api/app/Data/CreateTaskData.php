<?php

namespace App\Data;

use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use App\Http\Requests\CreateTaskRequest;
use Carbon\Carbon;

readonly class CreateTaskData
{
    public function __construct(
        public string $title,
        public ?string $description,
        public TaskStatus $status,
        public TaskPriority $priority,
        public ?Carbon $dueDate,
    ) {}

    public static function fromRequest(CreateTaskRequest $request): self
    {
        return new self(
            title: $request->validated('title'),
            description: $request->validated('description'),
            status: TaskStatus::from($request->validated('status', 'pending')),
            priority: TaskPriority::from($request->validated('priority', 'medium')),
            dueDate: $request->validated('due_date')
                ? Carbon::parse($request->validated('due_date'))
                : null,
        );
    }
}
