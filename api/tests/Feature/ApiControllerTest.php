<?php

use App\Http\Controllers\Api\ApiController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

it('returns a 400 error response', function () {
    $response = callProtected('error', ['Bad request']);

    expect($response->getStatusCode())->toBe(400)
        ->and($response->getData(true))->toBe(['message' => 'Bad request']);
});

it('returns a custom status error response', function () {
    $response = callProtected('error', ['Validation failed', 422]);

    expect($response->getStatusCode())->toBe(422)
        ->and($response->getData(true)['message'])->toBe('Validation failed');
});

it('returns a 404 not found response', function () {
    $response = callProtected('notFound');

    expect($response->getStatusCode())->toBe(404)
        ->and($response->getData(true)['message'])->toBe('Resource not found');
});

it('returns a custom not found message', function () {
    $response = callProtected('notFound', ['Task not found']);

    expect($response->getData(true)['message'])->toBe('Task not found');
});

it('returns a 403 forbidden response', function () {
    $response = callProtected('forbidden');

    expect($response->getStatusCode())->toBe(403)
        ->and($response->getData(true)['message'])->toBe('Forbidden');
});

it('returns a 500 server error response', function () {
    $response = callProtected('serverError');

    expect($response->getStatusCode())->toBe(500)
        ->and($response->getData(true)['message'])->toBe('Something went wrong');
});

it('returns json with custom status', function () {
    $response = callProtected('json', [['key' => 'value'], 201]);

    expect($response->getStatusCode())->toBe(201)
        ->and($response->getData(true))->toBe(['key' => 'value']);
});

/**
 * @throws ReflectionException
 */
function callProtected(string $method, array $args = []): JsonResponse|Response
{
    $controller = new class extends ApiController {};
    $reflection = new ReflectionMethod($controller, $method);

    return $reflection->invoke($controller, ...$args);
}
