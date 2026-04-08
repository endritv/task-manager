#!/bin/sh
set -e

# Wait for database then run migrations
php artisan migrate --force

# Start the application
exec "$@"
