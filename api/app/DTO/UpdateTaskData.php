<?php

namespace App\DTO;

use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use App\Http\Requests\UpdateTaskRequest;
use Carbon\Carbon;

readonly class UpdateTaskData
{
    public function __construct(
        public ?string $title,
        public ?string $description,
        public ?TaskStatus $status,
        public ?TaskPriority $priority,
        public ?Carbon $dueDate,
    ) {}

    public static function fromRequest(UpdateTaskRequest $request): self
    {
        $validated = $request->validated();

        return new self(
            title: $validated['title'] ?? null,
            description: $validated['description'] ?? null,
            status: isset($validated['status']) ? TaskStatus::from($validated['status']) : null,
            priority: isset($validated['priority']) ? TaskPriority::from($validated['priority']) : null,
            dueDate: isset($validated['due_date']) ? Carbon::parse($validated['due_date']) : null,
        );
    }
}
