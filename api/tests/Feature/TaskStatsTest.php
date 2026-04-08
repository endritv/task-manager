<?php

use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use App\Models\Task;

it('returns zero stats when no tasks exist', function () {
    $this->getJson(route('tasks.stats'))
        ->assertOk()
        ->assertJsonPath('totalTasks', 0)
        ->assertJsonPath('byStatus', [])
        ->assertJsonPath('byPriority', []);
});

it('returns correct stats grouped by status and priority', function () {
    Task::factory()->count(3)->create(['status' => TaskStatus::Pending, 'priority' => TaskPriority::High]);
    Task::factory()->count(2)->create(['status' => TaskStatus::Completed, 'priority' => TaskPriority::Low]);
    Task::factory()->create(['status' => TaskStatus::InProgress, 'priority' => TaskPriority::Medium]);

    $response = $this->getJson(route('tasks.stats'));

    $response->assertOk()
        ->assertJsonPath('totalTasks', 6)
        ->assertJsonPath('byStatus.'.TaskStatus::Pending->value, 3)
        ->assertJsonPath('byStatus.'.TaskStatus::Completed->value, 2)
        ->assertJsonPath('byStatus.'.TaskStatus::InProgress->value, 1)
        ->assertJsonPath('byPriority.'.TaskPriority::High->value, 3)
        ->assertJsonPath('byPriority.'.TaskPriority::Low->value, 2)
        ->assertJsonPath('byPriority.'.TaskPriority::Medium->value, 1);
});
