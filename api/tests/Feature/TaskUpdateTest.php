<?php

use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use App\Models\Task;

it('updates a task title', function () {
    $task = Task::factory()->create(['title' => 'Old title']);

    $this->putJson(route('tasks.update', $task), ['title' => 'New title'])
        ->assertOk()
        ->assertJsonPath('data.title', 'New title');

    $this->assertDatabaseHas('tasks', ['id' => $task->id, 'title' => 'New title']);
});

it('updates only the provided fields', function () {
    $task = Task::factory()->create([
        'title' => 'Keep this',
        'status' => TaskStatus::Pending,
        'priority' => TaskPriority::Low,
    ]);

    $this->putJson(route('tasks.update', $task), ['status' => TaskStatus::Completed->value])
        ->assertOk()
        ->assertJsonPath('data.status', TaskStatus::Completed->value)
        ->assertJsonPath('data.title', 'Keep this')
        ->assertJsonPath('data.priority', TaskPriority::Low->value);
});

it('validates title max length on update', function () {
    $task = Task::factory()->create();

    $this->putJson(route('tasks.update', $task), ['title' => str_repeat('a', 101)])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['title']);
});

it('validates status enum on update', function () {
    $task = Task::factory()->create();

    $this->putJson(route('tasks.update', $task), ['status' => 'invalid'])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['status']);
});

it('returns 404 when updating a non-existent task', function () {
    $this->putJson(route('tasks.update', 999), ['title' => 'Nope'])
        ->assertNotFound();
});
