#!/bin/sh
# Creates parallel test databases for PostgreSQL
# Usage: ./tests/create-parallel-databases.sh [num_processes]

PROCESSES=${1:-10}
DB_HOST=${DB_HOST:-127.0.0.1}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USERNAME:-user}

echo "Creating $PROCESSES parallel test databases..."

for i in $(seq 1 "$PROCESSES"); do
    DB_NAME="task_manager_test_$i"
    PGPASSWORD=${DB_PASSWORD:-password} psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres \
        -c "DROP DATABASE IF EXISTS \"$DB_NAME\";" \
        -c "CREATE DATABASE \"$DB_NAME\";" \
        > /dev/null 2>&1
    echo "  Created $DB_NAME"
done

echo "Done."
