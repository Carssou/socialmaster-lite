# Quick Start Guide - Social Master Lite

Get up and running with Social Master Lite in under 10 minutes.

## Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Git

## Setup Steps

### 1. Clone & Configure
```bash
# Clone the repository
git clone <repository-url>
cd socialmaster-lite

# Copy environment file
cp .env.example .env
```

### 2. Install Dependencies
```bash
# Backend dependencies
npm install

# Frontend dependencies
cd frontend && npm install && cd ..
```

### 3. Start Development Environment
```bash
# Start everything (Docker + Backend)
npm run dev
```

This command will:
- ✅ Start PostgreSQL and Redis containers
- ✅ Create database and run migrations
- ✅ Start the backend server on port 3001

### 4. Start Frontend (New Terminal)
```bash
cd frontend
npm run dev
```

The frontend will be available at http://localhost:5173

## Verify Setup

- **Backend API**: http://localhost:3001/api/health
- **Frontend**: http://localhost:5173
- **Database Admin**: http://localhost:8080 (admin@example.com / admin)
- **Redis Admin**: http://localhost:8081

## Essential Environment Variables

Edit `.env` with your actual values (optional for basic setup):

```env
# Required for AI insights
ANTHROPIC_API_KEY=your-anthropic-key
# OR
OPENAI_API_KEY=your-openai-key

# Required for Instagram scraping
APIFY_API_TOKEN=your-apify-token
```

## First Steps

1. **Register a new user** at http://localhost:5173/register
2. **Check logs** - new users need manual approval (`is_active: false`)
3. **Manually approve user** in database or through pgAdmin
4. **Login** and explore the dashboard

## Development Commands

```bash
# Backend
npm run dev          # Start with Docker + migrations
npm run dev:no-migrate  # Start without migrations
npm test            # Run tests
npm run lint        # Check code quality

# Frontend
cd frontend
npm run dev         # Start development server
npm run build       # Build for production

# Docker
npm run docker:up   # Start containers
npm run docker:down # Stop containers
```

## Troubleshooting

### Docker Issues
```bash
# Reset everything
docker-compose down -v
docker-compose up -d
```

### Database Issues
```bash
# Check database status
npm run db:migrate:status

# Reset migrations
npm run db:migrate:down
npm run db:migrate:up
```

### Port Conflicts
- Backend: Change `PORT=3001` in `.env`
- Frontend: Change port in `frontend/vite.config.ts`
- Database: Change `DB_PORT=5432` in `.env`

## Next Steps

- 📖 Read the complete [ONBOARDING.md](./ONBOARDING.md) guide
- 🔧 Configure API tokens for full functionality
- 🧪 Run the test suite: `npm run test`
- 🚀 Start building features!

---

**Need help?** Check the [ONBOARDING.md](./ONBOARDING.md) for detailed documentation.