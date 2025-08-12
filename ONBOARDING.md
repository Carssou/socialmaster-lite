# Social Master Lite - Developer Onboarding Guide

Welcome to Social Master Lite! This comprehensive guide will help you understand the project structure, set up your development environment, and start contributing effectively.

## Project Overview

Social Master Lite is a simplified social media analytics tool that emphasizes the "start simple, scale when needed" philosophy. It's designed to track Instagram accounts using Apify's API and provide AI-powered insights.

### Key Features
- Instagram profile and post data collection via Apify API
- User authentication with JWT tokens
- AI-powered insights generation (OpenAI/Anthropic)
- Team-based account management
- RESTful API with React frontend
- Manual user approval system for security

### Tech Stack

#### Backend
- **Language**: TypeScript + Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL with connection pooling
- **Cache/Sessions**: Redis (using ioredis client)
- **Authentication**: JWT with access/refresh tokens
- **Data Validation**: express-validator + Zod
- **Testing**: Jest (unit) + custom integration tests
- **Code Quality**: ESLint + Prettier
- **Process Management**: tsx for development, ts-node-dev for hot reloading

#### Frontend
- **Framework**: React 19+ with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS v4
- **Routing**: React Router DOM v7
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios
- **Icons**: Heroicons

#### Infrastructure
- **Containerization**: Docker Compose
- **Database**: PostgreSQL 15 (Alpine)
- **Cache**: Redis 7 (Alpine)
- **Development Tools**: pgAdmin, Redis Commander

#### External APIs
- **Apify**: Instagram scraping (actor: `shu8hvrXbJbY3Eb9W`)
- **AI Services**: OpenAI GPT-4 or Anthropic Claude

## Repository Structure

### Root Level Organization
```
socialmaster-lite/
├── src/                    # Backend TypeScript source
├── frontend/               # React application
├── __tests__/             # Jest test files
├── scripts/               # Development and deployment scripts
├── database/              # Database configuration
├── docker-compose.yml     # Container orchestration
├── CLAUDE.md             # Project guidance for Claude Code
└── package.json          # Backend dependencies and scripts
```

### Backend Structure (`src/`)
```
src/
├── app.ts                 # Express app configuration
├── index.ts              # Application entry point
├── database.ts           # Database connections and utilities
├── logger.ts             # Winston logging configuration
├── env.ts                # Environment variable validation
├── database/             # Data layer
│   ├── index.ts          # Database utilities and transactions
│   └── repository.ts     # Generic repository pattern
├── middleware/           # Express middleware
│   └── auth.middleware.ts # JWT authentication
├── routes/               # API route definitions
│   ├── index.ts          # Route aggregation
│   ├── auth.routes.ts    # Authentication endpoints
│   ├── user.routes.ts    # User management
│   ├── social-accounts.routes.ts # Account tracking
│   └── analytics.routes.ts # Data analysis endpoints
├── services/             # Business logic layer
│   ├── auth.service.ts   # User authentication
│   ├── apify.service.ts  # Instagram data collection
│   ├── ai-insights.service.ts # AI analysis
│   ├── social-account.service.ts # Account management
│   └── tier.service.ts   # Subscription logic
├── types/                # TypeScript definitions
│   ├── index.ts          # Common types and interfaces
│   └── models.ts         # Data models and DTOs
└── utils/                # Utility functions
    ├── errors.ts         # Custom error classes
    ├── jwt.ts            # Token generation/verification
    └── password.ts       # Password hashing
```

### Frontend Structure (`frontend/`)
```
frontend/
├── src/
│   ├── App.tsx           # Root component
│   ├── main.tsx          # React entry point
│   ├── components/       # Reusable UI components
│   ├── contexts/         # React contexts (Auth)
│   ├── pages/            # Route components
│   ├── services/         # API communication
│   ├── types/            # TypeScript interfaces
│   └── utils/            # Client-side utilities
├── public/               # Static assets
└── package.json          # Frontend dependencies
```

## Getting Started

### Prerequisites

**Required Software:**
- Node.js 18+ (LTS recommended)
- Docker and Docker Compose
- Git
- A code editor (VS Code recommended)

**Recommended Tools:**
- pgAdmin or similar PostgreSQL client
- Redis CLI or Redis Commander
- Postman/Insomnia for API testing

### Environment Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd socialmaster-lite
   ```

2. **Copy environment configuration:**
   ```bash
   cp .env.example .env
   ```

3. **Configure environment variables in `.env`:**
   ```env
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=socialmaster_lite
   DB_USER=postgres
   DB_PASSWORD=password

   # Authentication
   JWT_SECRET=your-super-secret-jwt-key
   JWT_REFRESH_SECRET=your-super-secret-refresh-key

   # APIs (optional for basic setup)
   APIFY_API_TOKEN=your-apify-token
   ANTHROPIC_API_KEY=your-anthropic-key
   # OR
   OPENAI_API_KEY=your-openai-key
   ```

### Installation and First Run

1. **Install backend dependencies:**
   ```bash
   npm install
   ```

2. **Install frontend dependencies:**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

3. **Start the development environment:**
   ```bash
   npm run dev
   ```

   This script will:
   - Start Docker containers (PostgreSQL, Redis)
   - Wait for services to be ready
   - Create database if it doesn't exist
   - Run database migrations
   - Start the backend development server

4. **Build and start frontend (in a new terminal):**
   ```bash
   cd frontend
   npm run dev
   ```

5. **Verify setup:**
   - Backend: http://localhost:3001/api/health
   - Frontend: http://localhost:5173
   - pgAdmin: http://localhost:8080 (admin@example.com / admin)
   - Redis Commander: http://localhost:8081

### Running Tests

```bash
# Backend unit tests
npm run test

# Watch mode for development
npm run test:watch

# All tests
npm run test:all
```

## Key Components Deep Dive

### Entry Points
- **Backend**: `src/index.ts` - Initializes database connections and starts Express server
- **Frontend**: `frontend/src/main.tsx` - React application root with router setup

### Authentication System
- **Location**: `src/services/auth.service.ts`, `src/middleware/auth.middleware.ts`
- **Pattern**: JWT-based with access/refresh token rotation
- **Security**: Manual user approval required (`is_active: false` by default)
- **Usage**: All protected routes use `authenticate` middleware

### Database Layer
- **Pattern**: Repository pattern with generic CRUD operations
- **Connection**: Individual client connections (not pool queries) to prevent hanging
- **Migrations**: Node-pg-migrate for schema management
- **Key Files**: 
  - `src/database/repository.ts` - Generic repository class
  - `src/database/index.ts` - Connection utilities and transactions

### API Routes Structure
- **Base**: `/api` prefix for all backend routes
- **Health Check**: `/api/health` - Service status endpoint
- **Authentication**: `/api/auth/*` - Registration, login, token refresh
- **User Management**: `/api/user/*` - Profile and settings
- **Social Accounts**: `/api/social-accounts/*` - Instagram account tracking
- **Analytics**: `/api/analytics/*` - Data insights and AI analysis

### Data Flow
1. **Authentication**: User registers → Admin approves → User can login
2. **Account Tracking**: User adds Instagram account → Apify scrapes data
3. **Analytics**: Raw data → AI service → Insights displayed in frontend

## Development Workflow

### Branch Management
- `main` - Production-ready code
- Feature branches: `feature/description`
- Bug fixes: `fix/description`

### Making Changes

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes and test:**
   ```bash
   # Run tests
   npm run test

   # Check code quality
   npm run lint
   npm run lint:fix
   ```

3. **Commit following conventional commits:**
   ```bash
   git commit -m "feat: add user profile endpoint"
   git commit -m "fix: resolve database connection leak"
   git commit -m "docs: update API documentation"
   ```

### Code Standards
- **TypeScript**: Strict mode enabled, comprehensive typing
- **Linting**: ESLint with TypeScript rules + Prettier
- **Testing**: Jest for unit tests, custom scripts for integration
- **Comments**: Minimal comments, self-documenting code preferred
- **Error Handling**: Custom ApiError classes with proper HTTP status codes

## Architecture Patterns & Decisions

### Design Patterns
- **Repository Pattern**: Generic database operations with type safety
- **Service Layer**: Business logic separation from controllers
- **Middleware Pattern**: Authentication, validation, error handling
- **DTO Pattern**: Data transfer objects for API boundaries

### Key Architectural Decisions

1. **Simplified from Enterprise Version**: 
   - Removed complex scraping infrastructure
   - Uses Apify API instead of custom solutions
   - Simplified subscription tiers
   - Removed queue systems

2. **Database Connection Strategy**:
   - Individual client connections instead of pool queries
   - Prevents connection hanging issues
   - Always release connections in finally blocks

3. **Manual User Approval**:
   - Security-first approach
   - New users start as inactive
   - Admin must manually approve accounts

4. **Type Safety**:
   - Database columns use snake_case
   - TypeScript models use camelCase
   - Automatic conversion in repository layer

5. **Error Handling**:
   - Centralized error handling with ApiError classes
   - Proper HTTP status codes
   - Development vs production error details

## Common Development Tasks

### Adding a New API Endpoint

1. **Create route handler** in appropriate route file:
   ```typescript
   // src/routes/example.routes.ts
   router.post('/new-endpoint', authenticate, validate(schema), async (req, res, next) => {
     try {
       const result = await exampleService.doSomething(req.body);
       res.json({ success: true, data: result });
     } catch (error) {
       next(error);
     }
   });
   ```

2. **Add service method** in relevant service:
   ```typescript
   // src/services/example.service.ts
   async doSomething(data: SomeDto): Promise<SomeResult> {
     // Business logic here
   }
   ```

3. **Add types** if needed:
   ```typescript
   // src/types/models.ts
   export interface SomeDto {
     field: string;
   }
   ```

### Adding Database Migrations

1. **Create migration file:**
   ```bash
   npm run db:migrate:create add_new_table
   ```

2. **Edit the generated migration file** with SQL:
   ```sql
   -- migrations/xxx_add_new_table.sql
   CREATE TABLE new_table (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     name VARCHAR(255) NOT NULL,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

3. **Run migration:**
   ```bash
   npm run db:migrate:up
   ```

### Creating React Components

1. **Follow existing patterns** in `frontend/src/components/`:
   ```typescript
   // frontend/src/components/NewComponent.tsx
   interface NewComponentProps {
     data: SomeData;
   }

   export const NewComponent: React.FC<NewComponentProps> = ({ data }) => {
     return <div>Component content</div>;
   };
   ```

2. **Add to appropriate page** in `frontend/src/pages/`

3. **Update types** in `frontend/src/types/index.ts`

### Testing New Features

1. **Write unit tests:**
   ```typescript
   // __tests__/feature.test.ts
   describe('New Feature', () => {
     test('should work correctly', async () => {
       const result = await service.newMethod();
       expect(result).toBeDefined();
     });
   });
   ```

2. **Test API endpoints** with Postman or curl scripts in `scripts/`

3. **Run full test suite:**
   ```bash
   npm run test:all
   ```

## Potential Gotchas & Common Issues

### Database Connection Issues
- **Problem**: Hanging connections, pool exhaustion
- **Solution**: Always use individual client connections, never forget `client.release()`
- **Pattern**: Use try/finally blocks consistently

### Authentication Edge Cases
- **Issue**: New users can't login immediately
- **Reason**: Manual approval required (`is_active: false`)
- **Solution**: Check user activation status, provide clear error messages

### Environment Configuration
- **Docker container names**: May vary based on project folder name
- **Database name**: Must match between `.env` and Docker Compose
- **Port conflicts**: Default ports may conflict with other services

### Frontend/Backend Communication
- **CORS issues**: Ensure origins are properly configured in app.ts
- **API base URLs**: Different for development vs production
- **Token storage**: Handled in AuthContext, check implementation

### Apify Integration
- **Rate limits**: Free tier has monthly limits ($5 credit)
- **Actor requirements**: Specific actor ID required (`shu8hvrXbJbY3Eb9W`)
- **Data structure**: Instagram data format may change

### AI Service Integration
- **API keys**: Required for AI insights generation
- **Token limits**: Both OpenAI and Anthropic have context limits
- **Error handling**: Network timeouts, rate limits

### Testing Environment
- **Database state**: Tests may interfere with each other
- **Environment variables**: Test config in `__tests__/setup.ts`
- **Async operations**: Proper await/async handling in tests

## Existing Documentation & Resources

### Project Documentation
- **CLAUDE.md** - Comprehensive project guidance for AI coding assistants
- **README.md** - Basic project overview and quick start
- **SIMPLIFICATION_TASKS.md** - Record of what was simplified from enterprise version

### Database Documentation
- **database_schema_only.sql** - Complete database schema
- **foreign_key_constraints.md** - Database relationship documentation
- **apify-fields-complete.md** - Apify API field reference

### Configuration Files
- **.env.example** - Complete environment variable template
- **docker-compose.yml** - Container configuration
- **database/database.json** - Database connection configuration for migrations

### Scripts & Tools
- **scripts/start-dev.sh** - Development startup script
- **scripts/migrate.sh** - Database migration wrapper
- **scripts/curl-auth-tests.sh** - API authentication testing

### API Reference
- Health check: `GET /api/health`
- OpenAPI/Swagger documentation: Not yet implemented (potential improvement)

## Next Steps & Onboarding Checklist

### Phase 1: Environment Setup ✓
1. [ ] Clone repository and install dependencies
2. [ ] Configure `.env` file with required variables
3. [ ] Start Docker services successfully
4. [ ] Run `npm run dev` without errors
5. [ ] Access frontend at http://localhost:5173
6. [ ] Verify backend health at http://localhost:3001/api/health

### Phase 2: Understanding the Codebase ✓
1. [ ] Explore the repository structure
2. [ ] Read through key files:
   - [ ] `src/index.ts` - Application entry point
   - [ ] `src/app.ts` - Express configuration
   - [ ] `src/services/auth.service.ts` - Authentication flow
   - [ ] `frontend/src/App.tsx` - Frontend entry point
3. [ ] Understand the database schema in `database_schema_only.sql`
4. [ ] Review the repository pattern in `src/database/repository.ts`

### Phase 3: Making Your First Change ✓
1. [ ] Create a test branch: `git checkout -b test/first-change`
2. [ ] Make a small change (e.g., update health check message)
3. [ ] Run tests: `npm run test`
4. [ ] Check code quality: `npm run lint`
5. [ ] Commit and push the change
6. [ ] Understand the git workflow

### Phase 4: Core Development Skills ✓
1. [ ] Run the test suite and understand the test structure
2. [ ] Create a new API endpoint (practice exercise)
3. [ ] Add a simple React component
4. [ ] Practice database operations with the repository pattern
5. [ ] Test authentication flow with Postman/curl

### Phase 5: Advanced Features ✓
1. [ ] Set up Apify integration with test token
2. [ ] Configure AI service (OpenAI or Anthropic)
3. [ ] Understand the social account tracking flow
4. [ ] Review analytics and insights generation
5. [ ] Explore the frontend data flow and state management

### Phase 6: Contributing ✓
1. [ ] Identify an area for improvement or new feature
2. [ ] Create a proper feature branch
3. [ ] Implement changes following project patterns
4. [ ] Add appropriate tests
5. [ ] Submit for code review

## Getting Help

### Documentation Priority
1. This ONBOARDING.md file
2. CLAUDE.md for AI-assisted development
3. README.md for quick reference
4. Code comments and TypeScript types
5. Test files for usage examples

### Common Questions
- **"How do I add a new database table?"** - Use migration scripts in `scripts/migrate.sh`
- **"Why can't users login after registration?"** - Manual approval required, check `is_active` field
- **"How do I test API endpoints?"** - Use scripts in `/scripts` or Postman collections
- **"Where is the database schema?"** - See `database_schema_only.sql`
- **"How do I deploy this?"** - Currently development-focused, deployment docs TBD

### Project Philosophy
Remember: **Start simple, scale when needed.** This project intentionally avoids over-engineering. When adding features, ask:
1. Is this necessary now?
2. Can we use an existing service instead of building custom?
3. Does this fit the "lite" philosophy?

The codebase is designed to be maintainable and understandable, prioritizing clarity over cleverness.

---

Welcome to the team! 🚀