<?php

use App\Models\User;

it('has the expected fillable attributes', function () {
    $user = new User();

    expect($user->getFillable())->toBe([
        'name',
        'email',
        'password',
    ]);
});

it('has the expected hidden attributes', function () {
    $user = new User();

    expect($user->getHidden())->toBe([
        'password',
        'remember_token',
    ]);
});

it('casts email_verified_at to datetime', function () {
    $user = new User();

    expect($user->getCasts()['email_verified_at'])->toBe('datetime');
});

it('casts password to hashed', function () {
    $user = new User();

    expect($user->getCasts()['password'])->toBe('hashed');
});
