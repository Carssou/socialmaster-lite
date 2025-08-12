# Database Data Export Summary

**Export Date:** August 12, 2025
**Source Database:** social_media_manager (PostgreSQL 15.13)
**Export File:** `database_data_export.sql`

## Tables Exported

### Core Tables
- **users** - 3 records
  - User accounts with authentication and tier information
  - Includes demo users and real user account
  
- **social_accounts** - 4 records
  - Connected social media accounts (Instagram, Twitter)
  - Links to users with platform credentials
  
- **tier_settings** - 2 records
  - Subscription tier configurations (free, basic)
  - Account limits and descriptions

### Data Collection Tables
- **apify_results** - 5 records
  - Apify API scraping run results
  - Raw data from Instagram scraping operations
  
- **apify_posts** - 15 records
  - Detailed Instagram posts data
  - Post metrics, content, and engagement data

### Analytics Tables
- **account_metrics** - 2 records
  - Daily account-level analytics
  - Follower growth, engagement rates
  
- **post_metrics** - 14 records
  - Individual post performance metrics
  - Likes, comments, shares, engagement rates

### AI Insights
- **ai_analysis** - 16 records
  - AI-generated insights about social media performance
  - Performance trends, optimization suggestions, alerts

## Data Export Details

- **Total Records:** 61 records across 8 tables
- **Export Format:** PostgreSQL COPY statements
- **File Size:** 147 lines
- **Includes:** All data with proper escaping and formatting
- **Ready for:** Database restoration or analysis

## Usage

To restore this data to a new database:
```bash
psql -h localhost -U postgres -d target_database < database_data_export.sql
```

## Data Privacy Note

This export contains demo data and sanitized user information. Real user credentials and sensitive data have been properly handled according to the application's privacy guidelines.