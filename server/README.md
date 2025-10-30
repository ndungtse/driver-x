# Driver Tracker API Server

Django REST API server for the Driver Tracker application, managed with `uv` package manager.

## Setup

### Prerequisites
- Python 3.13+
- [uv](https://github.com/astral-sh/uv) package manager

### Installation

1. Install dependencies:
```bash
uv sync
```

2. Run migrations:
```bash
uv run python manage.py migrate
```

3. Create a superuser (optional):
```bash
uv run python manage.py createsuperuser
```

## Running the Server

### Development Server
```bash
uv run python manage.py runserver
```

Or using main.py:
```bash
uv run python main.py runserver
```

The server will start at `http://127.0.0.1:8000/`

## API Endpoints

### Hello World
```
GET /api/hello/
```
Response:
```json
{
    "message": "Hello World!",
    "status": "API is running",
    "version": "1.0.0"
}
```

### Health Check
```
GET /api/health/
```
Response:
```json
{
    "status": "healthy",
    "service": "driver-tracker-api"
}
```

### Admin Panel
```
http://127.0.0.1:8000/admin/
```

## Project Structure

```
server/
├── api/                  # Main API app
│   ├── views.py         # API views
│   ├── urls.py          # API routes
│   └── apps.py          # App configuration
├── server/              # Django project settings
│   ├── settings.py     # Main settings
│   ├── urls.py         # Root URL configuration
│   └── wsgi.py         # WSGI configuration
├── manage.py           # Django management script
├── main.py            # Entry point (uv compatible)
└── pyproject.toml     # Project dependencies
```

## Common Commands

### npm-style shortcuts (recommended)
```bash
# Install dependencies
uv sync

# Run development server
uv run dev

# Apply migrations
uv run migrate

# Create migrations
uv run makemigrations

# Or use the task runner directly
uv run python tasks.py dev
uv run python tasks.py migrate
uv run python tasks.py superuser
```

### Standard Django commands
```bash
# Run server
uv run manage runserver
# or
uv run python manage.py runserver

# Make migrations
uv run python manage.py makemigrations

# Apply migrations
uv run python manage.py migrate

# Create superuser
uv run python manage.py createsuperuser

# Run shell
uv run python manage.py shell

# Create new app
uv run python manage.py startapp <app_name>
```

## Development

The project uses:
- **Django 5.2+** - Web framework
- **Django REST Framework** - API toolkit
- **django-cors-headers** - CORS handling for frontend integration

CORS is configured to allow requests from `http://localhost:3000` (Next.js frontend).

