<?php

namespace App\Providers;

use App\Events\TaskCreated;
use App\Events\TaskDeleted;
use App\Events\TaskUpdated;
use App\Listeners\LogTaskActivity;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Event::listen(TaskCreated::class, [LogTaskActivity::class, 'handleCreated']);
        Event::listen(TaskUpdated::class, [LogTaskActivity::class, 'handleUpdated']);
        Event::listen(TaskDeleted::class, [LogTaskActivity::class, 'handleDeleted']);
    }
}
