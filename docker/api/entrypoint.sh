#!/bin/sh
set -e

# Run migrations
php artisan migrate --force

# Seed database only if tasks table is empty
php artisan tinker --execute="exit(App\Models\Task::count() > 0 ? 0 : 1)" 2>/dev/null || php artisan db:seed --force

# Generate API docs with correct base URL
php artisan scribe:generate --no-interaction 2>/dev/null || true

# Start the application
exec "$@"
