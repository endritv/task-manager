#!/bin/sh
set -e

# Run migrations
php artisan migrate --force

# Generate API docs with correct base URL
php artisan scribe:generate --no-interaction 2>/dev/null || true

# Start the application
exec "$@"
