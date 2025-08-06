# Foreign Key Constraints Documentation

## Level 4 Dependencies (Leaf tables - remove first)
These tables only reference other tables but aren't referenced by any:

### Empty Tables (0 data):
- `account_group_memberships` → `account_groups`, `social_accounts`
- `competitive_analysis_results` → `teams`, `users`, `social_accounts`
- `competitor_accounts` → `teams`, `users`
- `competitor_metrics` → `competitor_accounts`
- `competitor_post_metrics` → `competitor_accounts`
- `content_patterns` → `teams`, `users`, `social_accounts`
- `data_cleanup_jobs` → `teams`
- `data_deduplication_log` → `raw_scraped_data`
- `insight_analysis_results` → `teams`, `users`, `social_accounts`
- `insight_patterns` → `ai_analysis`, `content_patterns`
- `insight_recommendations` → `ai_analysis`, `users`
- `market_position_snapshots` → `competitive_analysis_results`
- `normalized_data` → `social_accounts`, `raw_scraped_data`
- `performance_gaps` → `competitive_analysis_results`
- `strategy_configs` → `teams`, `users`
- `subscription_billing` → `teams`, `users`

### Tables with Minimal Data:
- `webhook_deliveries` → `webhooks` (3 inserts)
- `account_status_logs` → `social_accounts` (2 inserts)

## Level 3 Dependencies
These tables reference level 4 tables or are referenced by level 4 tables:

- `raw_scraped_data` → `social_accounts`
- `post_metrics` → `content`, `social_accounts`
- `content` → `teams`, `users`, `brand_guidelines`
- `brand_guidelines` → `teams`, `users`
- `account_monitoring_configs` → `social_accounts`
- `api_rate_limits` → `api_access_tokens`
- `subscription_history` → `teams`, `users`
- `subscription_usage` → `teams`, `users`
- `team_memberships` → `teams`, `users`
- `audit_logs` → `teams`, `users`
- `permissions` → `teams`, `users`

## Level 2 Dependencies 
These are referenced by level 3 tables:

- `account_groups` → `teams`, `users`
- `api_access_tokens` → `teams`, `users`
- `webhooks` → `teams`, `users`
- `ai_analysis` → `teams`, `users`, `social_accounts`

## Level 1 Dependencies (Core tables)
These are the foundation tables:

- `users` → `teams`
- `social_accounts` → `teams`, `users`, `account_groups`
- `account_metrics` → `social_accounts`
- `teams` (root table)

## Safe Removal Order

### Step 1: Drop Level 4 tables (safe to remove immediately)
```sql
DROP TABLE account_group_memberships CASCADE;
DROP TABLE competitive_analysis_results CASCADE;
DROP TABLE competitor_accounts CASCADE;
DROP TABLE competitor_metrics CASCADE;
DROP TABLE competitor_post_metrics CASCADE;
DROP TABLE content_patterns CASCADE;
DROP TABLE data_cleanup_jobs CASCADE;
DROP TABLE data_deduplication_log CASCADE;
DROP TABLE insight_analysis_results CASCADE;
DROP TABLE insight_patterns CASCADE;
DROP TABLE insight_recommendations CASCADE;
DROP TABLE market_position_snapshots CASCADE;
DROP TABLE normalized_data CASCADE;
DROP TABLE performance_gaps CASCADE;
DROP TABLE strategy_configs CASCADE;
DROP TABLE subscription_billing CASCADE;
DROP TABLE webhook_deliveries CASCADE;
DROP TABLE account_status_logs CASCADE;
```

### Step 2: Drop Level 3 tables
```sql
DROP TABLE raw_scraped_data CASCADE;
DROP TABLE post_metrics CASCADE; -- KEEP THIS ONE!
DROP TABLE content CASCADE;
DROP TABLE brand_guidelines CASCADE;
DROP TABLE account_monitoring_configs CASCADE;
DROP TABLE api_rate_limits CASCADE;
DROP TABLE subscription_history CASCADE;
DROP TABLE subscription_usage CASCADE;
DROP TABLE team_memberships CASCADE;
DROP TABLE audit_logs CASCADE;
DROP TABLE permissions CASCADE;
```

### Step 3: Drop Level 2 tables
```sql
DROP TABLE account_groups CASCADE;
DROP TABLE api_access_tokens CASCADE;
DROP TABLE webhooks CASCADE;
-- Keep ai_analysis for lite version
```

### Step 4: Modify core tables
- Remove team_id from users
- Remove team_id, primary_group_id from social_accounts
- Remove team_id from ai_analysis
- Keep: users, social_accounts, account_metrics, post_metrics, ai_analysis

## Tables to Preserve
1. `users` (simplified)
2. `social_accounts` (simplified)
3. `account_metrics` (unchanged)
4. `post_metrics` (unchanged) 
5. `ai_analysis` (simplified)
6. `pgmigrations` (system)