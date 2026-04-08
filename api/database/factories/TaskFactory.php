<?php

namespace Database\Factories;

use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

class TaskFactory extends Factory
{
    public function definition(): array
    {
        return [
            'title'       => fake()->sentence(3),
            'description' => fake()->optional()->paragraph(),
            'status'      => fake()->randomElement(TaskStatus::cases()),
            'priority'    => fake()->randomElement(TaskPriority::cases()),
            'due_date'    => fake()->optional()->dateTimeBetween('now', '+30 days'),
        ];
    }

    public function pending(): static
    {
        return $this->state(['status' => TaskStatus::Pending]);
    }

    public function completed(): static
    {
        return $this->state(['status' => TaskStatus::Completed]);
    }

    public function highPriority(): static
    {
        return $this->state(['priority' => TaskPriority::High]);
    }
}
