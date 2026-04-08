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
