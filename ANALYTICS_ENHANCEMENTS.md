# Analytics Page Enhancements

## Issue: Time Range Selector & Account Comparison Using Stored Data

### Description
The Analytics page now displays real data from the stored metrics, but we need to enhance it with time range filtering and account comparison functionality that leverages the historical data stored in the database.

### Current State ✅
- ✅ Analytics page modernized with Silicon Valley-style design
- ✅ KPI cards with trend indicators showing real data
- ✅ Interactive charts (Growth, Engagement, Content Performance) using real metrics
- ✅ Chart type selector working
- ✅ Export functionality (CSV/JSON) for current data
- ✅ Modern UI components using design system
- ✅ Real data integration (last 7 days of metrics)

### Required Enhancements 🚧

#### 1. Time Range Selector
**Backend Requirements:**
- Add time range filtering to analytics endpoints (`/api/analytics/:accountId/metrics`)
- Support query parameters: `?timeRange=7d|30d|90d|1y`
- Modify SQL queries to filter metrics by date range
- Ensure proper indexing on `created_at` column for performance

**Frontend Requirements:**
- Add back `timeRange` state variable
- Implement time range selector UI component  
- Update chart data fetching based on selected time range
- Update growth calculations to use selected period

**API Endpoint Updates Needed:**
```typescript
// Add to analytics.routes.ts
GET /api/analytics/:accountId/metrics?timeRange=30d&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
```

#### 2. Account Comparison Feature
**Backend Requirements:**
- Create comparison endpoint that accepts multiple account IDs
- Return normalized data structure for easy chart comparison
- Handle accounts with different data availability gracefully

**Frontend Requirements:**
- Enable comparison mode UI (already in place, needs backend integration)
- Fetch comparison data when second account selected
- Update charts to show multiple data series
- Add comparison legend and visual differentiation
- Comparison export functionality

**API Endpoint Needed:**
```typescript
// Add to analytics.routes.ts
GET /api/analytics/compare?accounts=id1,id2&timeRange=30d
```

#### 3. Advanced Time Period Selection
**Features to implement:**
- Custom date range picker
- Preset periods (Last 7 days, Last 30 days, Last 3 months, Last year)
- Period-over-period comparison (e.g., this month vs last month)

### Technical Implementation Notes

#### Database Schema Requirements
The current `account_metrics` table should already support this with:
- `account_id` (for filtering by account)
- `created_at` (for time range filtering)
- All metric fields (followers_count, engagement_rate, etc.)

#### Performance Considerations
- Add database indexes on commonly queried columns:
  ```sql
  CREATE INDEX idx_account_metrics_account_time ON account_metrics(account_id, created_at);
  CREATE INDEX idx_account_metrics_created_at ON account_metrics(created_at);
  ```

#### Frontend Chart Library
Currently using Recharts which supports:
- Multiple data series for comparison
- Custom time axis formatting
- Interactive tooltips
- Responsive design

### Acceptance Criteria

#### Time Range Selector
- [ ] User can select 7d/30d/90d/1y time ranges
- [ ] Charts update automatically when time range changes
- [ ] Growth calculations adjust to selected period
- [ ] Export includes data for selected time range only
- [ ] Loading states during data fetching
- [ ] Error handling for missing data periods

#### Account Comparison  
- [ ] User can enable comparison mode
- [ ] Select second account from dropdown (filtered list)
- [ ] Charts show both accounts with different colors/styles
- [ ] Legend clearly identifies each account
- [ ] Comparison data export (CSV/JSON)
- [ ] Performance metrics side-by-side comparison
- [ ] Graceful handling of accounts with different data availability

#### Custom Date Range (Future Enhancement)
- [ ] Date picker component for custom ranges
- [ ] Validation for reasonable date ranges
- [ ] Maximum range limits for performance

### Priority: High
This enhancement will significantly improve the analytics experience by allowing users to:
1. View historical trends over different time periods
2. Compare performance between multiple accounts
3. Make data-driven decisions based on historical analysis

### Estimated Development Time
- Backend API changes: 2-3 days
- Frontend implementation: 2-3 days  
- Testing and refinement: 1-2 days
- **Total: 5-8 days**

### Dependencies
- Requires sufficient historical data in database (at least 30-90 days for meaningful analysis)
- Database performance optimization may be needed for large datasets
- Consider data aggregation strategies for long time periods

---

## Implementation Status
- [x] Phase 1: Modern UI with real data integration (COMPLETED)
- [ ] Phase 2: Time range filtering (PENDING - THIS ISSUE)
- [ ] Phase 3: Account comparison (PENDING - THIS ISSUE)  
- [ ] Phase 4: Advanced features (custom date ranges, period-over-period)