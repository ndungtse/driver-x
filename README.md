# Driver Tracker

A full-stack application for truck drivers to plan trips, track Hours of Service (HOS), and generate compliant Electronic Logging Device (ELD) logbook sheets. The system calculates optimal routes with required rest stops and automatically generates daily log sheets according to FMCSA regulations.

## Overview

Driver Tracker helps property-carrying drivers comply with Hours of Service regulations by:
- Calculating optimal routes with required rest and fuel stops
- Tracking driver activities in a linear timeline
- Auto-generating compliant daily log sheets
- Visualizing routes on an interactive map

## Technology Stack

- **Backend**: Django REST Framework (Python)
- **Frontend**: Next.js 16 (React 19)
- **Package Managers**: 
  - Backend: `uv` (Python)
  - Frontend: `pnpm` (Node.js)

## Features

- **Trip Planning**: Input trip details (current location, pickup, dropoff, cycle hours used)
- **Route Calculation**: Automatic calculation of routes with waypoints and required stops
- **HOS Compliance**: Enforces 70-hour/8-day cycle limits with automatic break calculations
- **Activity Timeline**: Linear time-based activity tracking (off-duty, sleeper berth, driving, on-duty not driving)
- **Logbook Generation**: Auto-generates FMCSA-compliant daily log sheets with proper formatting
- **Route Visualization**: Interactive map showing route, stops, and activity markers

## Prerequisites

- **Python 3.13+**
- **Node.js 18+**
- **[uv](https://github.com/astral-sh/uv)** package manager (for Python)
- **pnpm** or npm (for Node.js)

## Quick Start

### Install Dependencies and Setup

Run the setup script to install all dependencies:

```bash
chmod +x setup.sh
./setup.sh
```

Or manually:

```bash
# Install root dependencies
npm install

# Setup server
cd server
uv sync
uv run python manage.py migrate

# Setup client
cd ../client
pnpm install
```

### Run Development Servers

Start both server and client concurrently:

```bash
npm run dev
```

This starts:
- **API Server**: http://127.0.0.1:8000/
- **Frontend**: http://localhost:3000

### Individual Commands

```bash
# Run server only
npm run dev:server

# Run client only
npm run dev:client

# Build for production
npm run build

# Run migrations
npm run migrate

# Create migrations
npm run makemigrations
```

## Project Structure

```
driver-tracker/
├── client/              # Next.js frontend application
│   ├── src/
│   │   ├── app/         # Next.js app router pages
│   │   ├── components/  # React components
│   │   ├── features/    # Feature modules (auth, trips)
│   │   └── lib/         # Utilities and API client
│   └── package.json
├── server/              # Django backend application
│   ├── api/             # Main API app
│   │   ├── models.py    # Data models
│   │   ├── views/       # API views
│   │   └── services/    # Business logic (HOS validation, route calculation)
│   ├── server/          # Django project settings
│   └── pyproject.toml
├── docs/                # Project documentation
│   ├── software-specs/  # Technical specifications
│   └── resources/       # Reference materials
└── package.json         # Root package with concurrent scripts
```

## Key Assumptions (Property-Carrying Driver)

- **70-hour/8-day cycle** limit
- **11-hour driving** limit per shift
- **14-hour on-duty** window
- **30-minute break** required after 8 hours of driving
- **Fueling** at least once every 1,000 miles
- **1 hour** for pickup and drop-off activities
- No adverse driving conditions

## API Endpoints

### Health & Status
- `GET /api/health/` - Health check
- `GET /api/hello/` - API status

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/refresh/` - Refresh access token

### Trips
- `GET /api/trips/` - List trips
- `POST /api/trips/` - Create new trip
- `GET /api/trips/:id/` - Get trip details
- `GET /api/trips/:id/logs/` - Get daily logs for trip

See [server/README.md](./server/README.md) for detailed API documentation.

## Development

### Server Development

```bash
cd server

# Run development server
uv run python manage.py runserver
# or
uv run dev

# Create migrations
uv run python manage.py makemigrations
# or
uv run makemigrations

# Apply migrations
uv run python manage.py migrate
# or
uv run migrate

# Create superuser
uv run python manage.py createsuperuser
# or
uv run python tasks.py superuser
```

### Client Development

```bash
cd client

# Run development server
pnpm dev

# Build for production
pnpm build

# Run production server
pnpm start

# Lint
pnpm lint
```

## Documentation

- [Software Specifications](./docs/software-specs/overview.md)
- [Data Models](./docs/software-specs/data-models.md)
- [HOS Rules](./docs/software-specs/hos-rules.md)
- [Logbook Generation](./docs/software-specs/logbook-generation.md)
- [Map Integration](./docs/software-specs/map-integration.md)
- [Timeline Input Flow](./docs/software-specs/timeline-input-flow.md)

## License

Private project

