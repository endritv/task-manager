# Task Manager

A full-stack task management application built with **Laravel 13**, **React 19**, **TypeScript**, and **PostgreSQL**.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Laravel 13 / PHP 8.5 |
| Frontend | React 19 / TypeScript / Vite |
| Database | PostgreSQL 15 |
| CSS | Tailwind CSS v4 / shadcn/ui |
| Testing | Pest (API) / Vitest (Frontend) |
| Infrastructure | Docker / Docker Compose |
| CI/CD | GitHub Actions |

## Quick Start with Docker

```bash
# Clone the repository
git clone https://github.com/endritv/task-manager.git
cd task-manager

# Start the full stack (PostgreSQL + API + Frontend)
make up

# Or without Make:
docker compose -f docker/docker-compose.yml -f docker/docker-compose.local.yml up -d

# Access the application
# Frontend: http://localhost:5173
# API:      http://localhost:8000
# API Docs: http://localhost:8000/api/docs
```

## Local Development (without Docker)

### Prerequisites

- PHP 8.5+ with pdo_pgsql extension
- Node.js 24+
- PostgreSQL 15+
- Composer

### API Setup

```bash
cd api
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan scribe:generate   # Generate API docs
php artisan serve
```

> **Note**: API documentation is auto-generated on Docker container start. When running locally, run `php artisan scribe:generate` to generate docs, then visit `http://localhost:8000/api/docs`.

### Frontend Setup

```bash
cd web
npm install
npm run dev
```

## Project Structure

```
task-manager/
├── api/                          # Laravel 13 backend
│   ├── app/
│   │   ├── Actions/              # Use-case orchestration + event dispatch
│   │   ├── DTO/                  # Data Transfer Objects (readonly)
│   │   ├── Enums/                # TaskStatus, TaskPriority
│   │   ├── Events/               # Domain events (TaskCreated, etc.)
│   │   ├── Exceptions/           # Global API exception handler
│   │   ├── Http/
│   │   │   ├── Controllers/Api/  # TaskController + ApiController base
│   │   │   ├── Middleware/       # Request logging
│   │   │   ├── Requests/         # FormRequest validation
│   │   │   └── Resources/        # API response transformation
│   │   ├── Listeners/            # Event listeners (audit logging)
│   │   ├── Models/               # Eloquent models with casts
│   │   └── Services/             # Data persistence + error handling
│   └── tests/                    # Pest tests (100% coverage)
├── web/                          # React 19 + TypeScript frontend
│   └── src/
│       ├── api/                  # Axios client + typed API functions
│       ├── components/           # TaskList, TaskCard, TaskForm, Dashboard
│       ├── hooks/                # useTasks, useTaskStats
│       ├── types/                # TypeScript interfaces + utility types
│       └── utils/                # formatDate, getApiError
├── docker/                       # Infrastructure
│   ├── docker-compose.yml        # Base (shared services)
│   ├── docker-compose.local.yml  # Local dev overrides
│   ├── docker-compose.staging.yml
│   ├── docker-compose.prod.yml
│   ├── api/                      # API Dockerfile (multi-stage)
│   └── web/                      # Web Dockerfile (multi-stage)
├── .github/workflows/            # CI pipelines
└── Makefile                      # Convenience commands
```

## Architecture

### Backend: Action + Service + DTO Pattern

```
Request -> FormRequest (validates) -> Controller -> DTO -> Action -> Service -> Model
                                                            |
                                                         Event -> Listener (audit log)
```

- **Controller**: thin HTTP layer, delegates everything
- **Action**: orchestrates use case, dispatches domain events
- **Service**: data persistence, error handling
- **Event**: domain events (TaskCreated, TaskUpdated, TaskDeleted)
- **Listener**: reacts to events (audit logging to dedicated channel + other stuff can be added like mail dispatches etc)
- **DTO**: readonly typed value objects for data transfer
- **FormRequest**: validation rules with enum support
- **Resource**: response transformation (snake_case -> camelCase)

### Frontend: Hooks + Controlled Components

- **Custom hooks** (`useTasks`, `useTaskStats`) manage all server state with explicit return type interfaces
- **Controlled forms** with `useState` for every field
- **Server-side search** with 300ms debounce (searches title + description)
- **Server-side filtering** by status and priority
- **`useCallback`** for memoized event handlers
- **Toast notifications** (sonner) for user feedback
- **Field-level validation** with API error mapping
- **Type guards** (`axios.isAxiosError`) instead of unsafe `as` casts

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tasks` | List tasks (paginated, sortable, searchable, filterable) |
| POST | `/api/tasks` | Create a task |
| GET | `/api/tasks/{id}` | Get a single task |
| PUT | `/api/tasks/{id}` | Update a task |
| DELETE | `/api/tasks/{id}` | Delete a task |
| GET | `/api/tasks/stats` | Get task statistics |

### Query Parameters (GET /api/tasks)

| Param | Type | Default | Description |
|---|---|---|---|
| `sort` | string | `created_at` | Sort field: created_at, due_date, priority, status, title |
| `direction` | string | `desc` | Sort direction: asc, desc |
| `per_page` | integer | `15` | Items per page (max 50) |
| `page` | integer | `1` | Page number |
| `search` | string | — | Search by title or description (case-insensitive) |
| `status` | string | — | Filter by status: pending, in_progress, completed |
| `priority` | string | — | Filter by priority: low, medium, high |

### Response Format

```json
{
  "data": {
    "id": 1,
    "title": "Implement user auth",
    "description": "Add JWT authentication",
    "status": "pending",
    "priority": "high",
    "dueDate": "2026-05-01T00:00:00+00:00",
    "createdAt": "2026-04-08T00:00:00+00:00",
    "updatedAt": "2026-04-08T00:00:00+00:00"
  }
}
```

### Error Format

```json
{
  "message": "Validation failed",
  "errors": {
    "title": ["The title field is required."]
  }
}
```

## Testing

```bash
# Run all tests
make test

# Backend tests
make test-api
make test-api-coverage
make test-parallel

# Frontend tests
make test-web
make test-web-coverage

# Linting
make lint
make typecheck
```

## Docker Environments

```bash
# Local development (HMR, debug mode)
make up

# Staging (nginx, php-fpm)
make staging-up

# Production (hardened, opcache, security headers)
make prod-up
```

## Available Make Commands

| Command | Description |
|---|---|
| `make up` | Start local development stack |
| `make down` | Stop all containers |
| `make build` | Rebuild and start containers |
| `make logs` | Follow container logs |
| `make test` | Run all tests (API + Web) |
| `make test-coverage` | Run tests with coverage reports |
| `make lint` | Run linters (Pint + ESLint) |
| `make typecheck` | Run TypeScript type checking |
| `make migrate` | Run database migrations |
| `make tinker` | Open Laravel Tinker REPL |
