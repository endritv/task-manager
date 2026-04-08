<?php

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;

it('returns consistent 404 for missing routes', function () {
    $this->getJson('/api/nonexistent')
        ->assertStatus(404)
        ->assertJsonPath('message', 'Resource not found');
});

it('returns model name in 404 for missing models', function () {
    $this->getJson(route('tasks.show', 999))
        ->assertStatus(404)
        ->assertJsonPath('message', 'Task not found');
});

it('returns 422 with field errors for validation failures', function () {
    $this->postJson(route('tasks.store'), [])
        ->assertStatus(422)
        ->assertJsonPath('message', 'Validation failed')
        ->assertJsonStructure(['message', 'errors']);
});

it('returns 500 and logs unhandled exceptions', function () {
    Log::spy();

    Route::get('/api/test-500', fn () => throw new RuntimeException('Boom'));

    $this->getJson('/api/test-500')
        ->assertStatus(500);

    Log::shouldHaveReceived('error')
        ->withArgs(fn (string $message, array $context) => $message === 'Unhandled exception'
            && $context['exception'] === 'RuntimeException'
            && $context['message'] === 'Boom'
        )
        ->once();
});

it('does not intercept non-api 404 routes', function () {
    $this->get('/nonexistent')
        ->assertStatus(404);
});

it('hides error details in production', function () {
    app()->detectEnvironment(fn () => 'production');

    Route::get('/api/test-prod-500', fn () => throw new RuntimeException('Secret error'));

    $this->getJson('/api/test-prod-500')
        ->assertStatus(500)
        ->assertJsonPath('message', 'Something went wrong');
})->after(fn () => app()->detectEnvironment(fn () => 'testing'));
