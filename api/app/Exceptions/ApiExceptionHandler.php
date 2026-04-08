<?php

namespace App\Exceptions;

use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

final class ApiExceptionHandler
{
    public static function register(Exceptions $exceptions): void
    {
        $exceptions->shouldRenderJsonWhen(fn (Request $request) =>
            $request->is('api/*') && ! $request->is('api/docs*')
        );

        $exceptions->render(function (NotFoundHttpException $e, Request $request) {
            if (! $request->is('api/*') || $request->is('api/docs*')) {
                return null;
            }

            $previous = $e->getPrevious();

            if ($previous instanceof ModelNotFoundException) {
                $model = class_basename($previous->getModel());
                return response()->json([
                    'message' => "{$model} not found",
                ], 404);
            }

            return response()->json([
                'message' => 'Resource not found',
            ], 404);
        });

        $exceptions->render(function (ValidationException $e, Request $request) {
            if ($request->is('api/*') && ! $request->is('api/docs*')) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $e->errors(),
                ], 422);
            }
        });

        $exceptions->render(function (\Throwable $e, Request $request) {
            if ($request->is('api/*') && ! $request->is('api/docs*')) {
                Log::error('Unhandled exception', [
                    'exception' => get_class($e),
                    'message' => $e->getMessage(),
                    'uri' => $request->getRequestUri(),
                ]);

                return response()->json([
                    'message' => app()->isProduction()
                        ? 'Something went wrong'
                        : $e->getMessage(),
                ], 500);
            }
        });
    }
}
