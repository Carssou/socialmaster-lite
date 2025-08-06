# Social Master Lite Simplification Tasks

## Phase 1: Database Schema Cleanup ✅ COMPLETED

### Phase 1.1: Backup and Preparation ✅
- [x] Create full database backup (backup_20250806_093117.sql - 278K)
- [x] Document current foreign key constraints (foreign_key_constraints.md)
- [x] Test backup restoration process (tested successfully)

### Phase 1.2: Remove Foreign Key Constraints ✅
- [x] Drop constraints from level 4 dependencies (leaf tables)
- [x] Drop constraints from level 3 dependencies  
- [x] Drop constraints from level 2 dependencies
- [x] Drop constraints from core tables that will be modified

### Phase 1.3: Drop Enterprise Tables (41 tables) ✅
- [x] Drop team management tables (7 tables)
- [x] Drop subscription system tables (4 tables)
- [x] Drop content creation tables (3 tables)
- [x] Drop competitive analysis tables (7 tables)
- [x] Drop advanced analytics tables (9 tables)
- [x] Drop data processing infrastructure tables (6 tables)
- [x] Drop API management tables (5 tables)
- [x] Drop views and materialized views

### Phase 1.4: Simplify Core Tables ✅
- [x] Remove `subscription_tier` and `team_id` columns from users table
- [x] Drop subscription and team-related indexes on users table
- [x] Remove `team_id` and `primary_group_id` columns from social_accounts table
- [x] Drop team-related indexes on social_accounts table
- [x] Remove `team_id` column from ai_analysis table
- [x] Update ai_analysis table structure for simplified use

### Phase 1.5: Clean Database Objects ✅
- [x] Drop unused custom types (enums) - removed 14 unused types
- [x] Drop unused functions and triggers related to deleted tables
- [x] Drop unused indexes
- [x] Run VACUUM and ANALYZE on remaining tables

**Phase 1 Results:**
- **47 tables → 6 tables** (87% reduction)
- **Final schema**: users, social_accounts, account_metrics, post_metrics, ai_analysis, pgmigrations
- **Data preserved**: 16 users, 33 social accounts, 263 account metrics, 4 post metrics
- **Database size**: Significantly reduced, optimized and cleaned

### Phase 1.6: Add Simple Tier Management ✅ COMPLETED
- [x] Create `tier_settings` table for flexible tier configuration
- [x] Add initial tier settings (free = 1 account, basic = 5 accounts)
- [x] Add `tier` column to users table (default 'free')
- [x] Create TierService for tier limit management
- [x] Create SocialAccountService with tier-based account limits
- [x] Update AuthService to work with simplified schema (no teams/subscriptions)

**Phase 1.6 Results:**
- **Flexible tier system**: Easy to modify limits via database (`UPDATE tier_settings`)
- **Clean business logic**: TierService handles all tier-related operations
- **Account limits enforced**: Users limited by their tier (free=1, basic=5)
- **Database schema**: 7 tables (added tier_settings)
- **All users default to 'free' tier** with 1 account limit

## Phase 2: TypeScript Types Simplification ✅ COMPLETED

### Phase 2.1: Remove Enterprise Types ✅
- [x] Remove all team-related interfaces from `src/types/index.ts`
- [x] Remove all subscription-related interfaces and enums
- [x] Remove brand guidelines and content creation types
- [x] Remove competitive analysis types
- [x] Remove advanced analytics types
- [x] Remove webhook and API management types

### Phase 2.2: Simplify Core Types ✅
- [x] Simplify `User` interface (remove subscriptionTier, teamId)
- [x] Simplify `SocialAccount` interface (remove teamId, primaryGroupId)
- [x] Simplify `AIAnalysis` interface (remove teamId)
- [x] Update database column mapping interfaces
- [x] Add tier-related types (`UserTier`, `TierSettings`, `TierLimits`)

### Phase 2.3: Update Type Exports ✅
- [x] Clean up `src/types/models.ts` exports (142 → 42 lines, 70% reduction)
- [x] Remove unused type imports throughout codebase
- [x] Update type definitions to match simplified database schema
- [x] Create missing utility files (jwt.ts, password.ts)

**Phase 2 Results:**
- **579 → 275 lines** in types/index.ts (52% reduction)
- **142 → 42 lines** in types/models.ts (70% reduction)
- **Removed enterprise types**: teams, subscriptions, permissions, competitive analysis
- **Added tier system types**: UserTier enum, TierSettings, TierLimits
- **Preserved AI insights types**: InsightType, InsightCategory, Impact/Urgency levels
- **Clean type structure** focused on core functionality

## Phase 3: Service Layer Simplification

### Phase 3.1: Remove Enterprise Services
- [ ] Delete team management service files
- [ ] Delete subscription management service files
- [ ] Delete content creation service files
- [ ] Delete competitive analysis service files
- [ ] Delete webhook management service files
- [ ] Delete advanced analytics service files

### Phase 3.2: Simplify Core Services
- [ ] Simplify `AuthService` - remove team creation logic
- [ ] Simplify `AuthService` - remove subscription tier checking
- [ ] Update user registration to not create teams
- [ ] Simplify social account services - remove team/group logic
- [ ] Update database queries to match simplified schema

### Phase 3.3: Add New Simplified Services
- [ ] Create `ApifyService` for Instagram data collection
- [ ] Create `AIInsightsService` for generating insights from metrics
- [ ] Integrate Apify API client and error handling
- [ ] Create simple insight generation algorithms

## Phase 4: Route and Middleware Cleanup

### Phase 4.1: Remove Enterprise Routes
- [ ] Delete team management route files
- [ ] Delete subscription management route files
- [ ] Delete content creation route files
- [ ] Delete competitive analysis route files
- [ ] Delete webhook management route files
- [ ] Delete advanced analytics route files

### Phase 4.2: Simplify Core Routes
- [ ] Update user routes - remove team/subscription logic
- [ ] Update social account routes - remove team/group features
- [ ] Add simple analytics routes for AI insights
- [ ] Update authentication routes
- [ ] Test all remaining route endpoints

### Phase 4.3: Middleware Simplification
- [ ] Remove subscription tier validation middleware
- [ ] Remove team permission checking middleware
- [ ] Remove rate limiting middleware (overkill for personal use)
- [ ] Remove audit logging middleware
- [ ] Keep basic authentication middleware
- [ ] Update error handling middleware

## Phase 5: Configuration and Infrastructure

### Phase 5.1: Environment and Config Cleanup
- [ ] Remove subscription tier environment variables
- [ ] Remove team/permission configuration variables
- [ ] Remove webhook configuration variables
- [ ] Add Apify API token configuration
- [ ] Update Docker environment variables
- [ ] Clean up unnecessary config files

### Phase 5.2: Database Connection Updates
- [ ] Update connection pool settings if needed
- [ ] Remove enterprise monitoring configurations
- [ ] Keep optimized connection handling
- [ ] Test database connectivity

### Phase 5.3: Package Dependencies
- [ ] Remove unused npm packages related to enterprise features
- [ ] Add Apify client dependency
- [ ] Update package.json scripts
- [ ] Clean up development dependencies

## Phase 6: Testing and Validation

### Phase 6.1: Core Functionality Testing
- [ ] Test user registration (simplified flow)
- [ ] Test user authentication
- [ ] Test social account connection (1-2 accounts max)
- [ ] Test Apify data collection integration
- [ ] Test AI insights generation

### Phase 6.2: Database Integrity Testing  
- [ ] Verify all foreign key constraints are properly handled
- [ ] Test data integrity after schema changes
- [ ] Verify metrics data is preserved and accessible
- [ ] Test database migrations work correctly

### Phase 6.3: Integration Testing
- [ ] Test complete user flow: register → connect account → view insights
- [ ] Test error handling for simplified services
- [ ] Verify no broken references to removed features
- [ ] Load test with realistic data volumes

## Phase 7: Documentation and Finalization

### Phase 7.1: Update Documentation
- [ ] Update API documentation for simplified endpoints
- [ ] Update database schema documentation
- [ ] Update development setup instructions
- [ ] Create simple user guide for 1-2 account analytics

### Phase 7.2: Code Quality
- [ ] Run linting on simplified codebase
- [ ] Remove unused imports and dead code
- [ ] Add comments explaining simplified architecture
- [ ] Ensure TypeScript compilation passes

### Phase 7.3: Deployment Preparation
- [ ] Update Docker configurations for simplified app
- [ ] Test production build process
- [ ] Verify environment variable setup
- [ ] Create deployment checklist for simplified version