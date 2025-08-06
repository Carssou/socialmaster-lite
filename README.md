# Social Master Lite

A simple, lightweight social media analytics tool.

## Philosophy

**Start simple, scale when needed.**

Instead of building complex scraping infrastructure, this version uses:
- ✅ Apify API for data collection (free tier = $5/month credits)
- ✅ Simple account management (1-2 accounts max)
- ✅ Basic AI insights
- ✅ Clean, maintainable codebase

## What's Different from Enterprise Version

**Removed (Overengineering):**
- ❌ Custom web scraping system
- ❌ Complex subscription tiers  
- ❌ Team management
- ❌ Queue systems with Bull/Redis
- ❌ Advanced CAPTCHA handling
- ❌ Premium features

**Kept (Good Foundation):**
- ✅ PostgreSQL database
- ✅ Docker setup
- ✅ Authentication
- ✅ RESTful API structure
- ✅ Basic account management

## Quick Start

```bash
# Copy environment file
cp .env.example .env

# Start services
docker-compose up -d

# Install dependencies
npm install

# Run migrations
npm run migrate

# Start development server
npm run dev
```

## Architecture

```
src/
├── config/          # Database, logger setup
├── services/
│   ├── auth.service.ts      # Authentication
│   ├── apify.service.ts     # Simple Apify integration
│   └── account.service.ts   # Basic account CRUD
├── routes/          # API endpoints
└── types/           # TypeScript definitions
```

## Cost Comparison

**Enterprise Version:**
- Development time: 40+ hours
- Maintenance: High complexity
- Scaling costs: Custom infrastructure

**Lite Version:**
- Development time: 2-3 hours
- Maintenance: Low complexity  
- Scaling costs: Pay Apify when you need it

## Next Steps

1. Add Apify integration
2. Create simple dashboard
3. Add basic AI insights
4. **Only add complexity when users demand it**

---

*"The best code is no code. The second best is simple code."*