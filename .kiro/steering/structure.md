# Project Structure

## Root Directory

```
yueying/
├── backend/              # FastAPI backend service
├── frontend/             # Next.js frontend application
├── nginx/                # Nginx reverse proxy configuration
├── docs/                 # Project documentation
├── logs/                 # Application logs
├── docker-compose.yml    # Docker Compose configuration
├── Makefile             # Common commands and shortcuts
├── .env                 # Environment variables (not in git)
└── .env.example         # Environment variables template
```

## Backend Structure

```
backend/
├── app/
│   ├── main.py                    # FastAPI application entry point
│   ├── core/                      # Core functionality
│   │   ├── config.py             # Settings management (Pydantic)
│   │   ├── database.py           # Database connection and session
│   │   ├── redis.py              # Redis connection
│   │   ├── security.py           # JWT and password hashing
│   │   ├── logging.py            # Logging configuration
│   │   ├── encryption.py         # Encryption utilities
│   │   ├── storage.py            # MinIO/S3 storage
│   │   ├── vector_db.py          # ChromaDB vector database
│   │   ├── scheduler.py          # APScheduler for background tasks
│   │   ├── task_manager.py       # Background task management
│   │   ├── websocket.py          # WebSocket connection manager
│   │   └── exceptions.py         # Custom exceptions
│   ├── api/
│   │   ├── dependencies/         # Dependency injection
│   │   │   └── auth.py          # Authentication dependencies
│   │   └── routes/              # API route handlers
│   │       ├── auth.py          # Authentication endpoints
│   │       ├── user_items.py    # User content records
│   │       ├── tags.py          # Tag management
│   │       ├── stats.py         # Statistics
│   │       ├── tmdb.py          # TMDB API integration
│   │       ├── google_books.py  # Google Books API
│   │       ├── bangumi.py       # Bangumi API
│   │       ├── unified_search.py # Unified search across sources
│   │       ├── llm.py           # LLM chat endpoints
│   │       ├── llm_config.py    # LLM configuration
│   │       ├── ai_tags.py       # AI tag generation
│   │       ├── recommendations.py # Recommendation engine
│   │       ├── rag.py           # RAG endpoints
│   │       ├── assistant.py     # AI assistant
│   │       ├── summary.py       # AI summary generation
│   │       ├── user_settings.py # User preferences
│   │       ├── system_settings.py # System settings
│   │       ├── websocket.py     # WebSocket endpoints
│   │       └── admin/           # Admin-only endpoints
│   ├── models/                   # SQLAlchemy ORM models
│   │   ├── base.py              # Base model with timestamps
│   │   ├── user.py              # User model
│   │   ├── item.py              # Content item model
│   │   ├── user_item.py         # User-item relationship
│   │   ├── tag.py               # Tag model
│   │   ├── conversation.py      # AI conversation history
│   │   ├── llm_config.py        # LLM configuration
│   │   ├── api_key_config.py    # API key storage
│   │   ├── summary.py           # AI-generated summaries
│   │   ├── background_task.py   # Background task tracking
│   │   ├── user_settings.py     # User preferences
│   │   └── system_settings.py   # System-wide settings
│   ├── schemas/                  # Pydantic schemas (request/response)
│   │   ├── user.py
│   │   ├── user_item.py
│   │   ├── tag.py
│   │   ├── stats.py
│   │   ├── tmdb.py
│   │   ├── google_books.py
│   │   ├── bangumi.py
│   │   ├── unified_search.py
│   │   ├── llm.py
│   │   ├── recommendation.py
│   │   ├── api_key.py
│   │   ├── log.py
│   │   ├── user_settings.py
│   │   └── system_settings.py
│   ├── services/                 # Business logic layer
│   │   ├── auth.py              # Authentication service
│   │   ├── user_item_service.py # User item CRUD
│   │   ├── tag_service.py       # Tag management
│   │   ├── stats_service.py     # Statistics calculation
│   │   ├── llm_service.py       # LLM interaction
│   │   ├── llm_config_service.py # LLM config management
│   │   ├── api_key_service.py   # API key management
│   │   ├── unified_search.py    # Multi-source search
│   │   ├── admin_service.py     # Admin operations
│   │   ├── log_service.py       # Log management
│   │   ├── user_settings_service.py # User preferences
│   │   ├── system_settings_service.py # System settings
│   │   ├── home_cache.py        # Home page data caching
│   │   ├── user_items_cache.py  # User items caching
│   │   └── external_apis/       # External API clients
│   │       ├── tmdb.py
│   │       ├── google_books.py
│   │       └── bangumi.py
│   ├── ai/                       # AI/ML modules
│   │   ├── tag_generator.py     # AI tag generation
│   │   ├── prompts/             # LLM prompt templates
│   │   │   ├── assistant.py
│   │   │   ├── summary.py
│   │   │   └── tag_generation.py
│   │   ├── embedding/           # Embedding service
│   │   │   └── embedding_service.py
│   │   ├── rag/                 # RAG implementation
│   │   │   ├── vector_store.py
│   │   │   └── retriever.py
│   │   ├── recommender/         # Recommendation algorithms
│   │   │   ├── collaborative.py
│   │   │   ├── content_based.py
│   │   │   ├── hybrid.py
│   │   │   └── utils.py
│   │   ├── summary/             # Summary generation
│   │   │   └── summary_service.py
│   │   └── assistant/           # AI assistant
│   │       └── assistant_service.py
│   ├── clients/                  # External service clients
│   │   └── llm/                 # LLM provider clients
│   │       ├── base.py
│   │       ├── openai_compatible.py
│   │       └── siliconflow.py
│   ├── middleware/               # Custom middleware
│   │   ├── logging_middleware.py
│   │   └── http_cache_middleware.py
│   └── utils/                    # Utility functions
│       ├── cache_keys.py        # Redis key patterns
│       ├── storage_keys.py      # MinIO key patterns
│       ├── field_selector.py    # Dynamic field selection
│       ├── file_validator.py    # File upload validation
│       ├── http_cache.py        # HTTP caching utilities
│       └── image_processor.py   # Image processing
├── alembic/                      # Database migrations
│   ├── versions/                # Migration scripts
│   └── env.py                   # Alembic environment
├── tests/                        # Test suite
│   ├── conftest.py              # Pytest configuration
│   ├── test_auth.py
│   ├── test_user_items.py
│   ├── test_tags.py
│   ├── test_tmdb.py
│   ├── test_google_books.py
│   ├── test_bangumi.py
│   ├── test_unified_search.py
│   ├── test_recommendations.py
│   ├── test_ai_tags.py
│   ├── test_llm.py
│   ├── test_cache.py
│   └── test_storage.py
├── scripts/                      # Utility scripts
│   ├── init_db.py               # Database initialization
│   ├── seed_data.py             # Seed test data
│   ├── reset_db.py              # Database reset
│   ├── create_admin.py          # Create admin user
│   ├── clear_cache.py           # Clear Redis cache
│   ├── download_model.py        # Download embedding model
│   ├── performance_test.py      # Performance testing
│   └── merge_migrations.py      # Merge migration scripts
├── data/                         # Data directory
│   └── chromadb/                # ChromaDB vector database
├── logs/                         # Application logs
├── docs/                         # Backend documentation
├── Dockerfile                    # Docker image definition
├── requirements.txt              # Python dependencies
├── pytest.ini                    # Pytest configuration
└── alembic.ini                   # Alembic configuration
```

## Frontend Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   ├── providers.tsx            # Context providers
│   ├── globals.css              # Global styles
│   ├── (auth)/                  # Auth route group
│   │   ├── login/
│   │   └── register/
│   ├── library/                 # User library
│   │   ├── page.tsx            # Library list
│   │   └── [id]/               # Item detail
│   ├── explore/                 # Search and explore
│   ├── discover/                # Recommendations
│   ├── stats/                   # Statistics
│   ├── assistant/               # AI assistant chat
│   ├── settings/                # User settings
│   │   ├── layout.tsx
│   │   ├── page.tsx            # General settings
│   │   └── ai/                 # AI settings
│   ├── admin/                   # Admin dashboard
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Dashboard
│   │   ├── users/              # User management
│   │   ├── llm-config/         # LLM configuration
│   │   ├── api-keys/           # API key management
│   │   ├── logs/               # System logs
│   │   ├── system/             # System settings
│   │   └── rag/                # RAG management
│   ├── api/                     # API routes (NextAuth)
│   │   ├── auth/
│   │   └── health/
│   └── components/              # Page-specific components (deprecated, use /components)
├── components/                   # React components
│   ├── ui/                      # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── form.tsx
│   │   ├── select.tsx
│   │   ├── tabs.tsx
│   │   ├── toast.tsx
│   │   ├── skeleton.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── alert.tsx
│   │   ├── loading.tsx
│   │   ├── empty.tsx
│   │   └── neumorphic-switch.tsx
│   ├── auth/                    # Authentication components
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   ├── UserMenu.tsx
│   │   └── ProtectedRoute.tsx
│   ├── common/                  # Common components
│   │   ├── Navbar.tsx
│   │   ├── Container.tsx
│   │   ├── PageHeader.tsx
│   │   ├── RatingBadge.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── GlobalTaskNotifications.tsx
│   ├── library/                 # Library components
│   │   ├── FilterPanel.tsx
│   │   ├── SortSelector.tsx
│   │   ├── ViewToggle.tsx
│   │   ├── GridView.tsx
│   │   ├── ListView.tsx
│   │   ├── ItemCard.tsx
│   │   ├── ItemRow.tsx
│   │   ├── EditForm.tsx
│   │   ├── DeleteConfirmDialog.tsx
│   │   └── LibrarySkeleton.tsx
│   ├── search/                  # Search components
│   │   ├── SearchBar.tsx
│   │   ├── SearchResults.tsx
│   │   ├── SearchCard.tsx
│   │   ├── SearchCardGrid.tsx
│   │   ├── SearchPagination.tsx
│   │   ├── FilterBar.tsx
│   │   ├── ContentTypeFilter.tsx
│   │   ├── AdvancedFilter.tsx
│   │   └── SearchResultsSkeleton.tsx
│   ├── content/                 # Content components
│   │   ├── ContentDetailDialog.tsx
│   │   └── QuickAddForm.tsx
│   ├── tags/                    # Tag components
│   │   ├── TagInput.tsx
│   │   └── AITagGenerator.tsx
│   ├── stats/                   # Statistics components
│   │   ├── OverviewCards.tsx
│   │   ├── TypeDistributionChart.tsx
│   │   ├── RatingDistributionChart.tsx
│   │   ├── StatusDistributionChart.tsx
│   │   ├── TimeTrendChart.tsx
│   │   ├── TopTagsCloud.tsx
│   │   ├── ActivityHeatmap.tsx
│   │   ├── ConsumptionAnalysis.tsx
│   │   ├── KeywordCloud.tsx
│   │   ├── AIInsights.tsx
│   │   ├── RecentActivityCarousel.tsx
│   │   ├── SummaryDisplay.tsx
│   │   ├── SummaryGeneratorDialog.tsx
│   │   ├── SummaryHistory.tsx
│   │   └── StatsSkeleton.tsx
│   ├── recommendations/         # Recommendation components
│   │   ├── RecommendationCard.tsx
│   │   ├── RecommendationList.tsx
│   │   └── SimilarItemsSection.tsx
│   ├── home/                    # Home page components
│   │   ├── HeroCarousel.tsx
│   │   ├── ContentSection.tsx
│   │   ├── ContentSectionWithYearTabs.tsx
│   │   ├── ContentCard.tsx
│   │   ├── RecommendationsSection.tsx
│   │   └── HomeSkeleton.tsx
│   ├── discover/                # Discovery components
│   │   └── DiscoverSkeleton.tsx
│   └── admin/                   # Admin components
│       ├── AdminSidebar.tsx
│       ├── AdminDashboardSkeleton.tsx
│       ├── UserTableView.tsx
│       ├── UserCardView.tsx
│       ├── UserFilterBar.tsx
│       ├── UserDetailDialog.tsx
│       ├── EditUserDialog.tsx
│       ├── DeleteUserDialog.tsx
│       ├── ToggleStatusDialog.tsx
│       ├── CreateAdminDialog.tsx
│       ├── LLMConfigForm.tsx
│       ├── LLMConfigSkeleton.tsx
│       ├── ApiKeyCard.tsx
│       ├── LogViewer.tsx
│       └── LogFilterBar.tsx
├── lib/                          # Utility functions and API clients
│   ├── api.ts                   # Base API client (axios)
│   ├── auth-api.ts              # Authentication API
│   ├── user-items-api.ts        # User items API
│   ├── tags-api.ts              # Tags API
│   ├── stats-api.ts             # Statistics API
│   ├── recommendations-api.ts   # Recommendations API
│   ├── ai-tags-api.ts           # AI tags API
│   ├── llm-config-api.ts        # LLM config API
│   ├── api-key-api.ts           # API key API
│   ├── log-api.ts               # Logs API
│   ├── summary-api.ts           # Summary API
│   ├── user-settings-api.ts     # User settings API
│   ├── system-settings-api.ts   # System settings API
│   ├── admin-api.ts             # Admin API
│   ├── websocket.ts             # WebSocket client
│   ├── events.ts                # Event emitter
│   ├── utils.ts                 # Utility functions (cn, etc.)
│   ├── cache-manager.ts         # Client-side caching
│   ├── performance.ts           # Performance monitoring
│   ├── prefetch.ts              # Data prefetching
│   ├── route-prefetch.ts        # Route prefetching
│   ├── code-splitting.ts        # Code splitting utilities
│   ├── lazy-load.tsx            # Lazy loading HOC
│   ├── image-optimization.ts    # Image optimization
│   ├── font-optimization.ts     # Font optimization
│   ├── css-optimization.ts      # CSS optimization
│   ├── script-optimization.ts   # Script optimization
│   ├── resource-hints.ts        # Resource hints
│   └── sw-register.ts           # Service worker registration
├── hooks/                        # Custom React hooks
│   ├── use-toast.ts             # Toast notifications
│   ├── use-debounce.ts          # Debounce hook
│   ├── use-search-history.ts    # Search history
│   ├── use-system-settings.ts   # System settings hook
│   ├── use-websocket-notifications.ts # WebSocket notifications
│   └── use-log-websocket.ts     # Log streaming
├── store/                        # Zustand state management
│   ├── authStore.ts             # Authentication state
│   ├── uiStore.ts               # UI state (theme, etc.)
│   └── assistantStore.ts        # AI assistant state
├── types/                        # TypeScript type definitions
│   ├── index.ts                 # Common types
│   ├── user-item.ts
│   ├── tag.ts
│   ├── stats.ts
│   ├── recommendation.ts
│   ├── ai-tags.ts
│   ├── llm-config.ts
│   ├── api-key.ts
│   ├── log.ts
│   ├── admin.ts
│   ├── user-settings.ts
│   ├── system-settings.ts
│   └── next-auth.d.ts           # NextAuth type extensions
├── config/                       # Configuration files
│   └── site.ts                  # Site configuration
├── public/                       # Static assets
├── middleware.ts                 # Next.js middleware (auth)
├── next.config.js               # Next.js configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
├── postcss.config.js            # PostCSS configuration
├── components.json              # shadcn/ui configuration
├── package.json                 # Dependencies
└── Dockerfile                   # Docker image definition
```

## Key Conventions

### Backend

- **Models**: SQLAlchemy models in `app/models/`, inherit from `BaseModel` for timestamps
- **Schemas**: Pydantic schemas in `app/schemas/` for request/response validation
- **Services**: Business logic in `app/services/`, keep routes thin
- **Dependencies**: Use FastAPI dependency injection for auth, database sessions
- **Error Handling**: Use custom exceptions from `app/core/exceptions.py`
- **Logging**: Use loguru logger from `app.core.logging`
- **Caching**: Redis keys defined in `app/utils/cache_keys.py`

### Frontend

- **Components**: Organized by feature/domain, use shadcn/ui for base components
- **API Calls**: Centralized in `lib/*-api.ts` files, use React Query for data fetching
- **State**: Use Zustand for global state, React Query for server state
- **Forms**: React Hook Form + Zod validation
- **Styling**: Tailwind CSS with `cn()` utility from `lib/utils.ts`
- **Types**: TypeScript types in `types/` directory
- **Routes**: App Router in `app/` directory, use route groups for organization

### Database

- **Migrations**: Alembic migrations in `backend/alembic/versions/`
- **Naming**: Use snake_case for table and column names
- **Timestamps**: All models have `created_at` and `updated_at` via `TimestampMixin`
- **Indexes**: Add indexes for frequently queried columns
- **Comments**: Add Chinese comments to tables and columns for clarity
