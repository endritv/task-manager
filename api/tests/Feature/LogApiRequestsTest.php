<?php

use App\Http\Middleware\LogApiRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

it('logs request details to the api channel', function () {
    $logged = false;

    Log::shouldReceive('channel')
        ->with('api')
        ->andReturnSelf();

    Log::shouldReceive('info')
        ->withArgs(function (string $message, array $context) use (&$logged) {
            $logged = $message === 'API Request'
                && $context['method'] === 'GET'
                && $context['uri'] === '/test'
                && $context['status'] === 200
                && str_contains($context['duration'], 'ms')
                && isset($context['ip']);

            return true;
        })
        ->once();

    $middleware = new LogApiRequests;
    $request = Request::create('/test', 'GET');

    $middleware->handle($request, fn () => new JsonResponse(['ok' => true], 200));

    expect($logged)->toBeTrue();
});

it('logs the correct status code', function () {
    Log::shouldReceive('channel')
        ->with('api')
        ->andReturnSelf();

    Log::shouldReceive('info')
        ->withArgs(function (string $message, array $context) {
            return $context['status'] === 404;
        })
        ->once();

    $middleware = new LogApiRequests;
    $request = Request::create('/missing', 'GET');

    $middleware->handle($request, fn () => new JsonResponse(['error' => 'not found'], 404));
});

it('logs POST method correctly', function () {
    Log::shouldReceive('channel')
        ->with('api')
        ->andReturnSelf();

    Log::shouldReceive('info')
        ->withArgs(function (string $message, array $context) {
            return $context['method'] === 'POST' && $context['status'] === 201;
        })
        ->once();

    $middleware = new LogApiRequests;
    $request = Request::create('/tasks', 'POST');

    $middleware->handle($request, fn () => new JsonResponse(['data' => []], 201));
});
