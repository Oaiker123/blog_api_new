<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }

    public function render($request, Throwable $exception)
    {
        if ($exception instanceof \Spatie\Permission\Exceptions\UnauthorizedException) {
            return response()->json([
                'message' => 'Ban khong co quyen truy cap.'
            ], 403);
        }

        if ($exception instanceof \Illuminate\Auth\AuthenticationException) {
        return response()->json([
            'message' => 'Vui long dang nhap de tiep tuc.'
        ], 401);
    }

        return parent::render($request, $exception);
    }

}
