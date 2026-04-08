<?php

use App\Models\Task;

it('returns a single task by id', function () {
    $task = Task::factory()->create(['title' => 'My task']);

    $this->getJson(route('tasks.show', $task))
        ->assertOk()
        ->assertJsonPath('data.id', $task->id)
        ->assertJsonPath('data.title', 'My task')
        ->assertJsonStructure([
            'data' => ['id', 'title', 'description', 'status', 'priority', 'dueDate', 'createdAt', 'updatedAt'],
        ]);
});

it('returns camelCase keys in the response', function () {
    $task = Task::factory()->create(['due_date' => now()->addWeek()]);

    $response = $this->getJson(route('tasks.show', $task));

    expect($response->json('data'))->toHaveKeys(['dueDate', 'createdAt', 'updatedAt']);
});

it('returns 404 for a non-existent task', function () {
    $this->getJson(route('tasks.show', 999))
        ->assertNotFound();
});

it('serialises null due_date as null in response', function () {
    $task = Task::factory()->create(['due_date' => null]);
    $this->getJson(route('tasks.show', $task))
        ->assertJsonPath('data.dueDate', null);
});

it('serialises due_date as ISO 8601 string when set', function () {
    $task = Task::factory()->create(['due_date' => '2026-06-01']);
    $response = $this->getJson(route('tasks.show', $task));
    expect($response->json('data.dueDate'))->toStartWith('2026-06-01');
});
