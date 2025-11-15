# Technology Stack

## Architecture

Full-stack application with separate frontend and backend services, containerized with Docker.

## Frontend

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode enabled)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **State Management**: Zustand
- **Data Fetching**: React Query (@tanstack/react-query)
- **Forms**: React Hook Form + Zod validation
- **Authentication**: NextAuth.js
- **Charts**: Recharts
- **Icons**: Lucide React

### Frontend Path Aliases

```typescript
@/* - Root directory
@/components/* - React components
@/lib/* - Utility functions and API clients
@/hooks/* - Custom React hooks
@/store/* - Zustand stores
@/types/* - TypeScript type definitions
@/config/* - Configuration files
```

## Backend

- **Framework**: FastAPI
- **Language**: Python 3.11+
- **ORM**: SQLAlchemy 2.0
- **Migrations**: Alembic
- **Validation**: Pydantic v2
- **Authentication**: JWT (python-jose)
- **Password Hashing**: bcrypt (passlib)
- **HTTP Client**: httpx (async)
- **JSON Serialization**: orjson (high performance)

### Backend Structure

```
app/
├── main.py              # FastAPI application entry
├── core/                # Core configuration (config, database, security, logging)
├── api/                 # API routes
│   ├── routes/         # Route handlers
│   └── dependencies/   # Dependency injection (auth, etc.)
├── models/             # SQLAlchemy models
├── schemas/            # Pydantic schemas
├── services/           # Business logic layer
├── ai/                 # AI modules (LLM, RAG, recommendations, embeddings)
├── clients/            # External API clients
├── middleware/         # Custom middleware
└── utils/              # Utility functions
```

## Infrastructure

- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **Object Storage**: MinIO (S3-compatible)
- **Vector Database**: ChromaDB (for RAG/embeddings)
- **Reverse Proxy**: Nginx
- **Containerization**: Docker + Docker Compose

## AI/ML Stack

- **LLM Providers**: SiliconFlow (primary), DeepSeek, OpenAI, Anthropic Claude
- **Embeddings**: sentence-transformers (paraphrase-multilingual-MiniLM-L12-v2)
- **Recommendations**: scikit-learn (collaborative filtering, content-based)
- **Vector Search**: ChromaDB

## Common Commands

### Docker Operations

```bash
# Start all services
make up
docker-compose up -d

# Stop all services
make down
docker-compose down

# View logs
make logs
make logs-backend
make logs-frontend

# Rebuild images
make build
docker-compose build --no-cache

# Check service status
make ps
docker-compose ps
```

### Database Operations

```bash
# Run migrations
make migrate
docker-compose exec backend alembic upgrade head

# Create new migration
make migrate-create
docker-compose exec backend alembic revision --autogenerate -m "description"

# Rollback migration
docker-compose exec backend alembic downgrade -1

# Load seed data
make seed
docker-compose exec backend python scripts/seed_data.py

# Database shell
make shell-db
docker-compose exec postgres psql -U yueying -d yueying

# Backup database
make backup-db

# Restore database
make restore-db
```

### Backend Development

```bash
# Enter backend container
make shell-backend
docker-compose exec backend bash

# Run tests
make test-backend
docker-compose exec backend pytest

# Run tests with coverage
docker-compose exec backend pytest --cov=app --cov-report=html

# Format code
docker-compose exec backend black .
docker-compose exec backend isort .

# Type checking
docker-compose exec backend mypy .

# Start dev server (outside Docker)
cd backend
uvicorn app.main:app --reload
```

### Frontend Development

```bash
# Enter frontend container
make shell-frontend
docker-compose exec frontend sh

# Run tests
make test-frontend
docker-compose exec frontend npm test

# Type check
docker-compose exec frontend npm run type-check

# Lint
docker-compose exec frontend npm run lint

# Format
docker-compose exec frontend npm run format

# Start dev server (outside Docker)
cd frontend
npm run dev
```

### Project Initialization

```bash
# First-time setup
make init

# This will:
# 1. Copy .env.example to .env
# 2. Start database services
# 3. Wait for services to be ready
```

## Environment Variables

Key environment variables are managed through `.env` file:

- **Database**: `DATABASE_URL`, `POSTGRES_USER`, `POSTGRES_PASSWORD`
- **Redis**: `REDIS_URL`, `REDIS_PASSWORD`
- **MinIO**: `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`
- **JWT**: `JWT_SECRET_KEY`, `ACCESS_TOKEN_EXPIRE_MINUTES`
- **External APIs**: `TMDB_API_KEY`, `GOOGLE_BOOKS_API_KEY`, `BANGUMI_API_KEY`
- **LLM APIs**: `SILICONFLOW_API_KEY`, `DEEPSEEK_API_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`
- **Frontend**: `NEXT_PUBLIC_API_URL`, `NEXTAUTH_SECRET`

## Performance Optimizations

- **Backend**: orjson for JSON serialization, Redis caching, database indexing, connection pooling
- **Frontend**: Code splitting, lazy loading, image optimization (WebP/AVIF), route prefetching
- **Middleware**: Gzip compression, HTTP caching (ETag), logging middleware
