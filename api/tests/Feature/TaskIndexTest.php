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

it('caps per_page at 50', function () {
    Task::factory()->count(60)->create();
    $this->getJson(route('tasks.index', ['per_page' => 200]))
        ->assertOk()
        ->assertJsonPath('meta.per_page', 50)
        ->assertJsonCount(50, 'data');
});

it('ignores invalid sort direction and defaults to desc', function () {
    $this->travel(-1)->days();
    Task::factory()->create(['title' => 'Old']);
    $this->travelBack();
    Task::factory()->create(['title' => 'New']);

    $response = $this->getJson(route('tasks.index', ['direction' => 'DROP TABLE']));
    expect($response->json('data.0.title'))->toBe('New');
});

it('filters tasks by search term in title', function () {
    Task::factory()->create(['title' => 'Fix login bug']);
    Task::factory()->create(['title' => 'Add dashboard']);
    Task::factory()->create(['title' => 'Update login page']);

    $response = $this->getJson(route('tasks.index', ['search' => 'login']));

    $response->assertOk()->assertJsonCount(2, 'data');
    expect(collect($response->json('data'))->pluck('title')->toArray())
        ->each->toContain('login');
});

it('filters tasks by search term in description', function () {
    Task::factory()->create(['title' => 'Task A', 'description' => 'Fix the authentication flow']);
    Task::factory()->create(['title' => 'Task B', 'description' => 'Update the UI']);

    $response = $this->getJson(route('tasks.index', ['search' => 'authentication']));

    $response->assertOk()->assertJsonCount(1, 'data');
    expect($response->json('data.0.title'))->toBe('Task A');
});

it('filters tasks by status', function () {
    Task::factory()->create(['status' => 'pending']);
    Task::factory()->create(['status' => 'pending']);
    Task::factory()->create(['status' => 'completed']);

    $response = $this->getJson(route('tasks.index', ['status' => 'pending']));

    $response->assertOk()->assertJsonCount(2, 'data');
    expect(collect($response->json('data'))->pluck('status')->unique()->toArray())
        ->toBe(['pending']);
});

it('filters tasks by priority', function () {
    Task::factory()->create(['priority' => 'high']);
    Task::factory()->create(['priority' => 'low']);
    Task::factory()->create(['priority' => 'high']);

    $response = $this->getJson(route('tasks.index', ['priority' => 'high']));

    $response->assertOk()->assertJsonCount(2, 'data');
    expect(collect($response->json('data'))->pluck('priority')->unique()->toArray())
        ->toBe(['high']);
});

it('combines search with status and priority filters', function () {
    Task::factory()->create(['title' => 'Fix login', 'status' => 'pending', 'priority' => 'high']);
    Task::factory()->create(['title' => 'Fix login CSS', 'status' => 'completed', 'priority' => 'high']);
    Task::factory()->create(['title' => 'Add dashboard', 'status' => 'pending', 'priority' => 'high']);

    $response = $this->getJson(route('tasks.index', [
        'search' => 'login',
        'status' => 'pending',
        'priority' => 'high',
    ]));

    $response->assertOk()->assertJsonCount(1, 'data');
    expect($response->json('data.0.title'))->toBe('Fix login');
});

it('returns empty results when search matches nothing', function () {
    Task::factory()->count(3)->create();

    $response = $this->getJson(route('tasks.index', ['search' => 'nonexistent_xyz']));

    $response->assertOk()->assertJsonCount(0, 'data');
});
