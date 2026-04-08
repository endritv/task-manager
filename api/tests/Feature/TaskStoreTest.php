<?php

use App\Enums\TaskPriority;
use App\Enums\TaskStatus;

it('creates a task with required fields only', function () {
    $this->postJson(route('tasks.store'), ['title' => 'My task'])
        ->assertCreated()
        ->assertJsonPath('data.title', 'My task')
        ->assertJsonPath('data.status', TaskStatus::Pending->value)
        ->assertJsonPath('data.priority', TaskPriority::Medium->value);

    $this->assertDatabaseHas('tasks', ['title' => 'My task']);
});

it('creates a task with all fields', function () {
    $payload = [
        'title' => 'Full task',
        'description' => 'Some details',
        'status' => TaskStatus::InProgress->value,
        'priority' => TaskPriority::High->value,
        'due_date' => '2026-05-01',
    ];

    $this->postJson(route('tasks.store'), $payload)
        ->assertCreated()
        ->assertJsonPath('data.title', 'Full task')
        ->assertJsonPath('data.description', 'Some details')
        ->assertJsonPath('data.status', TaskStatus::InProgress->value)
        ->assertJsonPath('data.priority', TaskPriority::High->value);

    $this->assertDatabaseHas('tasks', ['title' => 'Full task', 'status' => TaskStatus::InProgress->value]);
});

it('validates title is required', function () {
    $this->postJson(route('tasks.store'), [])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['title']);
});

it('validates title max length', function () {
    $this->postJson(route('tasks.store'), ['title' => str_repeat('a', 101)])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['title']);
});

it('validates status must be a valid enum', function () {
    $this->postJson(route('tasks.store'), ['title' => 'Test', 'status' => 'invalid'])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['status']);
});

it('validates priority must be a valid enum', function () {
    $this->postJson(route('tasks.store'), ['title' => 'Test', 'priority' => 'urgent'])
        ->assertStatus(422)
        ->assertJsonValidationErrors(['priority']);
});
