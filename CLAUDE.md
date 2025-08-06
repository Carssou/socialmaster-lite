# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Social Master Lite is a **simplified version** of the overengineered "socialmaster" project. After spending hours building enterprise-grade complexity for a personal project, we stripped it back to basics while preserving the solid foundation.

**Philosophy: Start simple, scale when needed.**

Instead of building custom scraping infrastructure, this version uses Apify's API ($5/month free tier = 8-20 Instagram accounts) and focuses on core functionality.

## Core Commands

### Development
- `npm run dev` - Start development server with automatic database setup and migrations
- `npm run dev:no-migrate` - Start development server without migrations
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run production build

### Testing
- `npm run test` - Run Jest unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:e2e` - Run Playwright end-to-end tests
- `npm run test:e2e:ui` - Run E2E tests with Playwright UI
- `npm run test:all` - Run all tests (unit + E2E)

### Code Quality
- `npm run lint` - Check code with ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier

### Database
- `npm run db:migrate` - Run database migrations
- `npm run db:migrate:up` - Run pending migrations
- `npm run db:migrate:down` - Rollback last migration
- `npm run db:migrate:create` - Create new migration file
- `npm run db:migrate:status` - Check migration status

### Docker
- `npm run docker:up` - Start all Docker services
- `npm run docker:down` - Stop all Docker services
- `npm run docker:logs` - View Docker logs

## Architecture Overview

### Database Layer
- **PostgreSQL**: Primary database with connection pooling via `pgPool`
- **Redis**: Caching and session management via `redisClient`
- **Migrations**: Node-pg-migrate for schema management
- **Repository Pattern**: Generic repository class in `src/database/repository.ts`

### Authentication
- **JWT-based**: Access and refresh tokens
- **Manual Approval**: New users require admin activation (`is_active: false` by default)
- **Team-based**: Each user belongs to a team with role-based access
- **Middleware**: `authenticate` and `optionalAuthenticate` in `src/middleware/auth.middleware.ts`

### Core Services
- **AuthService** (`src/services/auth.service.ts`): User registration, login, token management
- Database connection handling uses individual client connections to prevent hanging issues

### Type System
- Comprehensive TypeScript types in `src/types/`
- Enum-based constants for platforms, content types, subscription tiers
- Database column names use snake_case, TypeScript models use camelCase

### Development Environment
- Docker Compose setup with PostgreSQL, Redis, pgAdmin, and Redis Commander
- Development script handles Docker startup and database initialization
- Hot reloading with ts-node-dev

## What Was Kept vs Removed

### ✅ Kept (The Good Foundation)
- **Database schema and tables** - Well-designed domain models
- **Authentication system** - JWT-based auth with proper middleware
- **API routes structure** - Clean RESTful endpoints
- **Docker setup** - PostgreSQL, Redis, development environment
- **TypeScript types** - Comprehensive type definitions
- **Repository pattern** - Generic database abstraction

### ❌ Removed/Disabled (The Overengineering)
- **Custom scraping system** - Complex CAPTCHA handling, browser fingerprinting
- **Subscription tiers** - Enterprise/Premium features for a personal project
- **Team management** - Permission matrices and team hierarchies
- **Queue systems** - Bull/Redis job processing
- **Advanced monitoring** - Enterprise-grade analytics and reporting
- **Competitive analysis** - Premium features that won't be used

## Key Design Principles

1. **Simplicity First**: Use Apify API instead of custom scraping (5 lines vs 500)
2. **Database Connection Management**: Use individual clients instead of pool queries to prevent hanging
3. **Manual User Approval**: Security-first approach with admin activation required
4. **Minimal Subscription Logic**: Remove tier complexity, everyone gets basic (1-2 accounts max)
5. **TypeScript Throughout**: Comprehensive type safety with proper DB column mapping

## Environment Variables

The application expects a `.env` file with database connection details, JWT secrets, and other configuration. Copy `.env.example` to `.env` and configure as needed.

## Testing Strategy

- **Unit Tests**: Jest for service layer and utilities
- **E2E Tests**: Playwright for full application flows
- **Integration Tests**: Custom scripts in `/scripts` directory for API testing

## Apify Integration Approach

For reference, there's a clean Apify integration example in `instagram-scraper.ts` - **use this as inspiration** for building the new simplified service:

### Pattern to Follow (from instagram-scraper.ts)
- **Simple API calls**: Clean ApifyClient usage with proper error handling
- **Type safety**: Well-defined interfaces (`InstagramProfile`, `InstagramPost`)
- **Custom error classes**: `InstagramScraperError` for specific error handling
- **Engagement calculation**: Built-in metrics (avg likes, comments, engagement rate)
- **Batch processing**: Handle single usernames or arrays consistently

### Recommended Apify Service Structure
```typescript
// New service to create: src/services/apify.service.ts
export class ApifyService {
  async scrapeInstagram(username: string) {
    // Simple 5-line implementation using ApifyClient
    // Follow the pattern from instagram-scraper.ts but adapted for the app
  }
}
```

### Environment Setup
- Requires `APIFY_API_TOKEN` environment variable
- Apify actor: `shu8hvrXbJbY3Eb9W` (Instagram Scraper)
- Free tier provides $5/month credits (8-20 profiles)

## Database Schema Notes

- Users are inactive by default (`is_active: false`) requiring manual approval
- Team-based access control with membership roles
- Snake_case column names in database, camelCase in TypeScript models
- Connection pool configured with specific timeouts to prevent hanging connections

## Scale When You Need It Philosophy

**Phase 1**: Use Apify ($5/month free tier)
**Phase 2**: If you hit $500/month in Apify costs, you probably have revenue
**Phase 3**: If Apify becomes 30%+ of costs, THEN consider custom scraping

Don't build Phase 3 infrastructure for Phase 0 usage!