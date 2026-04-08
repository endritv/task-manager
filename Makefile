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
	docker exec -it task-manager-api-1 sh
migrate:
	docker exec task-manager-api-1 php artisan migrate
seed:
	docker exec task-manager-api-1 php artisan db:seed
tinker:
	docker exec -it task-manager-api-1 php artisan tinker

# Testing
test: test-api test-web
test-api:
	cd api && composer test
test-web:
	cd web && npm test
test-coverage: test-api-coverage test-web-coverage
test-api-coverage:
	cd api && composer test:coverage
test-web-coverage:
	cd web && npm run test:coverage
test-parallel:
	cd api && composer test:parallel
lint: lint-api lint-web
lint-api:
	cd api && ./vendor/bin/pint --test
lint-web:
	cd web && npm run lint
typecheck:
	cd web && npm run typecheck

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

.PHONY: up down build restart logs ps clean api-shell migrate seed tinker test test-api test-web test-coverage test-api-coverage test-web-coverage test-parallel lint lint-api lint-web typecheck staging-up staging-down prod-up prod-down
