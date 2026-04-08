<?php

use App\Models\Task;

it('returns an empty paginated list when no tasks exist', function () {
    $this->getJson(route('tasks.index'))
        ->assertOk()
        ->assertJsonPath('data', [])
        ->assertJsonPath('meta.total', 0);
});

it('returns paginated tasks', function () {
    Task::factory()->count(3)->create();

    $this->getJson(route('tasks.index'))
        ->assertOk()
        ->assertJsonCount(3, 'data')
        ->assertJsonStructure([
            'data' => [['id', 'title', 'status', 'priority', 'createdAt']],
            'meta' => ['current_page', 'last_page', 'per_page', 'total'],
        ]);
});

it('sorts tasks by created_at desc by default', function () {
    $this->travel(-1)->days();
    Task::factory()->create(['title' => 'Old']);

    $this->travelBack();
    Task::factory()->create(['title' => 'New']);

    $response = $this->getJson(route('tasks.index'));

    expect($response->json('data.0.title'))->toBe('New')
        ->and($response->json('data.1.title'))->toBe('Old');
});

it('sorts tasks by a given field', function () {
    Task::factory()->create(['title' => 'Banana']);
    Task::factory()->create(['title' => 'Apple']);

    $response = $this->getJson(route('tasks.index', ['sort' => 'title', 'direction' => 'asc']));

    expect($response->json('data.0.title'))->toBe('Apple')
        ->and($response->json('data.1.title'))->toBe('Banana');
});

it('ignores invalid sort fields', function () {
    Task::factory()->count(2)->create();

    $this->getJson(route('tasks.index', ['sort' => 'password', 'direction' => 'asc']))
        ->assertOk()
        ->assertJsonCount(2, 'data');
});
