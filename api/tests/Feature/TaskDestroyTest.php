<?php

use App\Models\Task;

it('deletes a task', function () {
    $task = Task::factory()->create();

    $this->deleteJson(route('tasks.destroy', $task))
        ->assertNoContent();

    $this->assertDatabaseMissing('tasks', ['id' => $task->id]);
});

it('returns 404 when deleting a non-existent task', function () {
    $this->deleteJson(route('tasks.destroy', 999))
        ->assertNotFound();
});
