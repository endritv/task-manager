# Task Manager - Development Commands
# Usage: make [command]

COMPOSE = docker compose -f docker/docker-compose.yml -f docker/docker-compose.local.yml

# Docker
up:
	$(COMPOSE) up -d
down:
	$(COMPOSE) down
build:
	$(COMPOSE) up --build -d
restart:
	$(COMPOSE) restart
logs:
	$(COMPOSE) logs -f
ps:
	$(COMPOSE) ps
clean:
	$(COMPOSE) down -v --remove-orphans

# API
api-shell:
	$(COMPOSE) exec api sh
migrate:
	$(COMPOSE) exec api php artisan migrate
seed:
	$(COMPOSE) exec api php artisan db:seed
tinker:
	$(COMPOSE) exec api php artisan tinker

# Testing
test: test-api test-web
test-api:
	$(COMPOSE) exec api php artisan test
test-web:
	$(COMPOSE) exec web npx vitest run
test-coverage: test-api-coverage test-web-coverage
test-api-coverage:
	$(COMPOSE) exec api php artisan test --coverage --min=100
test-web-coverage:
	$(COMPOSE) exec web npx vitest run --coverage
test-parallel:
	$(COMPOSE) exec api php artisan test --parallel
lint: lint-api lint-web
lint-api:
	$(COMPOSE) exec api vendor/bin/pint --test
lint-fix:
	$(COMPOSE) exec api vendor/bin/pint
lint-web:
	$(COMPOSE) exec web npx eslint . --ignore-pattern 'coverage/**'
typecheck:
	$(COMPOSE) exec web npx tsc -p tsconfig.app.json --noEmit
ci: lint typecheck test-coverage

# Staging
staging-up:
	docker compose -f docker/docker-compose.yml -f docker/docker-compose.staging.yml up --build -d
staging-down:
	docker compose -f docker/docker-compose.yml -f docker/docker-compose.staging.yml down

# Production
prod-up:
	docker compose -f docker/docker-compose.yml -f docker/docker-compose.prod.yml up --build -d
prod-down:
	docker compose -f docker/docker-compose.yml -f docker/docker-compose.prod.yml down

.PHONY: up down build restart logs ps clean api-shell migrate seed tinker test test-api test-web test-coverage test-api-coverage test-web-coverage test-parallel lint lint-api lint-fix lint-web typecheck ci staging-up staging-down prod-up prod-down
