# Social Master Lite

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19+-blue.svg)](https://reactjs.org/)

A simple, lightweight social media analytics tool that provides Instagram insights through AI-powered analysis.

## 📖 Documentation

- **⚡ [Quick Start Guide](./QUICKSTART.md)** - Get running in 10 minutes
- **📚 [Complete Onboarding](./ONBOARDING.md)** - Comprehensive developer guide
- **🤖 [Claude AI Guide](./CLAUDE.md)** - AI-assisted development instructions

## 🎯 Philosophy

**Start simple, scale when needed.**

Instead of building complex scraping infrastructure, this version uses:

- ✅ Apify API for Instagram data collection
- ✅ AI-powered insights (OpenAI/Anthropic integration)
- ✅ Manual user approval for security
- ✅ Clean, maintainable TypeScript codebase
- ✅ Docker-based development environment

## 🏗 Tech Stack

### Backend

- **TypeScript + Node.js** - Server-side development
- **Express.js** - Web framework with middleware
- **PostgreSQL** - Primary database with connection pooling
- **Redis** - Caching and session management
- **JWT Authentication** - Access/refresh token system

### Frontend

- **React 19 + TypeScript** - Modern UI development
- **Vite** - Fast build tool and dev server
- **TailwindCSS v4** - Utility-first styling
- **React Router v7** - Client-side routing

### Infrastructure

- **Docker Compose** - Local development environment
- **Jest** - Unit testing framework
- **ESLint + Prettier** - Code quality and formatting

## ⚡ Quick Start

```bash
# 1. Clone and configure
git clone <repository-url>
cd socialmaster-lite
cp .env.example .env

# 2. Install dependencies
npm install
cd frontend && npm install && cd ..

# 3. Start development environment
npm run dev  # Starts Docker + Backend

# 4. Start frontend (new terminal)
cd frontend && npm run dev
```

**Access Points:**

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api/health
- Database Admin: http://localhost:8080
- Redis Admin: http://localhost:8081

## 📁 Project Structure

```
socialmaster-lite/
├── src/                    # Backend TypeScript source
│   ├── app.ts              # Express application setup
│   ├── index.ts            # Application entry point
│   ├── database.ts         # Database connections
│   ├── database-optimization.ts  # DB performance utilities
│   ├── logger.ts           # Winston logging setup
│   ├── env.ts              # Environment validation
│   ├── database/
│   │   ├── index.ts        # DB utilities & transactions
│   │   └── repository.ts   # Generic repository pattern
│   ├── services/           # Business logic layer
│   │   ├── auth.service.ts # User authentication
│   │   ├── apify.service.ts # Instagram data collection
│   │   ├── social-account.service.ts  # Account management
│   │   ├── ai-insights.service.ts     # AI analysis
│   │   └── tier.service.ts # Subscription logic
│   ├── routes/             # API endpoint definitions
│   │   ├── index.ts        # Route aggregation
│   │   ├── auth.routes.ts  # Authentication endpoints
│   │   ├── social-accounts.routes.ts  # Account tracking
│   │   ├── analytics.routes.ts # Data analysis
│   │   └── user.routes.ts  # User management
│   ├── middleware/         # Express middleware
│   │   └── auth.middleware.ts  # JWT authentication
│   ├── types/              # TypeScript definitions
│   │   ├── index.ts        # Common interfaces
│   │   └── models.ts       # Data models & DTOs
│   ├── utils/              # Utility functions
│   │   ├── errors.ts       # Custom error classes
│   │   ├── jwt.ts          # Token generation
│   │   └── password.ts     # Password hashing
│   └── prompts/            # AI prompt templates
│       └── instagram-insights.prompt.md
├── frontend/               # React application
│   ├── src/
│   │   ├── App.tsx         # Root component
│   │   ├── main.tsx        # React entry point
│   │   ├── components/     # Reusable UI components
│   │   │   ├── Layout.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── contexts/       # React contexts
│   │   │   └── AuthContext.tsx
│   │   ├── pages/          # Route components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Settings.tsx
│   │   │   ├── Analytics.tsx
│   │   │   └── SocialAccounts.tsx
│   │   ├── services/       # API communication
│   │   │   └── api.ts
│   │   ├── types/          # Frontend types
│   │   │   └── index.ts
│   │   └── utils/          # Client utilities
│   │       └── validation.ts
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
├── __tests__/              # Jest unit tests
│   ├── setup.ts           # Test configuration
│   ├── auth.service.test.ts
│   ├── social-account.service.test.ts
│   └── [other test files]
├── scripts/                # Development utilities
│   ├── start-dev.sh       # Development startup
│   ├── migrate.sh         # Database migrations
│   ├── init-db.sh         # Database initialization
│   └── [other scripts]
├── database/               # Database configuration
│   ├── database.json      # Migration config
│   └── init/              # Initialization scripts
├── CLAUDE.md              # AI development guide
├── ONBOARDING.md          # Developer onboarding
├── QUICKSTART.md          # Quick setup guide
├── docker-compose.yml     # Container orchestration
├── package.json           # Backend dependencies
└── [config files]         # ESLint, TypeScript, etc.
```

## 🚀 Key Features

- **Instagram Analytics** - Profile and post data collection via Apify
- **AI Insights** - Automated analysis using OpenAI or Anthropic
- **User Authentication** - JWT-based auth with manual approval system
- **Team Management** - Basic multi-user support with role-based access
- **Real-time Dashboard** - React-based analytics interface
- **Docker Development** - Fully containerized local environment

## 🛠 Development Commands

```bash
# Backend Development
npm run dev              # Start with Docker + migrations
npm run dev:no-migrate   # Start without running migrations
npm test                 # Run Jest unit tests
npm run lint             # Check code quality
npm run build            # Compile TypeScript

# Frontend Development
cd frontend
npm run dev             # Start Vite dev server
npm run build           # Build for production
npm run lint            # Check React code quality

# Database Management
npm run db:migrate:up       # Run pending migrations
npm run db:migrate:down     # Rollback last migration
npm run db:migrate:create   # Create new migration file
npm run db:migrate:status   # Check migration status

# Docker Management
npm run docker:up       # Start all containers
npm run docker:down     # Stop all containers
npm run docker:logs     # View container logs
```

## 🔧 Configuration

### Required Environment Variables

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=socialmaster_lite
DB_USER=postgres
DB_PASSWORD=password

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production

# AI Service (choose one)
LLM_PROVIDER=anthropic  # or "openai"

# Anthropic Configuration
ANTHROPIC_API_KEY=your-anthropic-api-key
ANTHROPIC_MODEL=claude-sonnet-4-20250514

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-5-mini

# Instagram Data Collection
APIFY_API_TOKEN=your-apify-api-token
```

### Optional Configuration

```env
# Application
NODE_ENV=development
PORT=3000
BASE_URL=http://localhost:3000
LOG_LEVEL=info

# Database Pool
DB_SSL=false
DB_POOL_MIN=2
DB_POOL_MAX=10
```

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test -- --coverage

# Run specific test file
npm run test auth.service.test.ts
```

## 📊 What's Different from Enterprise Version

**Removed Complexity:**

- ❌ Custom web scraping infrastructure
- ❌ Complex subscription tiers and billing
- ❌ Advanced team permission matrices
- ❌ Queue systems (Bull/Redis jobs)
- ❌ Advanced CAPTCHA handling
- ❌ Enterprise monitoring and alerting

**Kept Core Foundation:**

- ✅ Solid database schema and migrations
- ✅ JWT authentication with refresh tokens
- ✅ Repository pattern for data access
- ✅ Docker development environment
- ✅ Comprehensive TypeScript types
- ✅ RESTful API structure

## 🚨 Troubleshooting

### Common Issues

**Docker Won't Start:**

```bash
# Reset Docker environment
docker-compose down -v
docker system prune -f
npm run docker:up
```

**Database Connection Issues:**

```bash
# Check database status
npm run db:migrate:status

# Reset and rebuild database
npm run docker:down
npm run docker:up
npm run db:migrate:up
```

**Port Conflicts:**

- Backend: Change `PORT` in `.env`
- Frontend: Modify `frontend/vite.config.ts`
- Database: Change `DB_PORT` in `.env`

**Permission Issues:**

- New users are inactive by default (`is_active: false`)
- Admin must manually approve users in database
- Check user status in pgAdmin at http://localhost:8080

### Getting Help

1. Check the [ONBOARDING.md](./ONBOARDING.md) comprehensive guide
2. Review existing [test files](./__tests__/) for usage examples
3. Examine the [CLAUDE.md](./CLAUDE.md) for AI development patterns
4. Look at [scripts/](./scripts/) for development utilities

## 🤝 Contributing

1. Read the [ONBOARDING.md](./ONBOARDING.md) guide
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Follow the existing code patterns and TypeScript conventions
4. Add tests for new functionality
5. Run linting: `npm run lint`
6. Submit a pull request

### Code Standards

- **TypeScript**: Strict mode, comprehensive typing
- **Testing**: Unit tests for services, integration tests for APIs
- **Linting**: ESLint + Prettier configuration
- **Commits**: Conventional commit format preferred

## 🙏 Acknowledgments

- Built with the philosophy of **"Start simple, scale when needed"**
- Apify for Instagram data collection APIs
- OpenAI/Anthropic for AI insights generation
- The open-source community for excellent tools and libraries

---

_"The best code is no code. The second best is simple code."_

**Ready to get started?** Follow the [Quick Start Guide](./QUICKSTART.md) →
