<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Http\Response;

abstract class ApiController extends Controller
{
    protected function success(JsonResource $resource): JsonResponse
    {
        return $resource->response();
    }

    protected function created(JsonResource $resource): JsonResponse
    {
        return $resource->response()->setStatusCode(201);
    }

    protected function noContent(): Response
    {
        return response()->noContent();
    }

    protected function collection(ResourceCollection $collection): ResourceCollection
    {
        return $collection;
    }

    protected function json(mixed $data, int $status = 200): JsonResponse
    {
        return response()->json($data, $status);
    }

    protected function error(string $message, int $status = 400): JsonResponse
    {
        return response()->json([
            'message' => $message,
        ], $status);
    }

    protected function notFound(string $message = 'Resource not found'): JsonResponse
    {
        return $this->error($message, 404);
    }

    protected function forbidden(string $message = 'Forbidden'): JsonResponse
    {
        return $this->error($message, 403);
    }

    protected function serverError(string $message = 'Something went wrong'): JsonResponse
    {
        return $this->error($message, 500);
    }
}
