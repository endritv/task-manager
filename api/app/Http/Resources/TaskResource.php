<?php

namespace App\Http\Resources;

use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Task
 */
class TaskResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'title'       => $this->title,
            'description' => $this->description,
            'status'      => $this->status->value,
            'priority'    => $this->priority->value,
            'dueDate'     => $this->due_date?->toIso8601String(),
            'createdAt'   => $this->created_at->toIso8601String(),
            'updatedAt'   => $this->updated_at->toIso8601String(),
        ];
    }
}
