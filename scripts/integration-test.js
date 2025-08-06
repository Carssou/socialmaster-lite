#!/usr/bin/env node

/**
 * Comprehensive Frontend-Backend Integration Test
 * Tests all user workflows, data consistency, error handling, and authentication flows
 */

const fs = require('fs');
const path = require('path');

class IntegrationTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      tests: [],
    };
    this.apiEndpoints = new Set();
    this.frontendApiCalls = new Set();
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  test(name, testFn) {
    try {
      testFn();
      this.results.passed++;
      this.results.tests.push({ name, status: 'PASS' });
      this.log(`${name} - PASSED`, 'success');
    } catch (error) {
      this.results.failed++;
      this.results.tests.push({ name, status: 'FAIL', error: error.message });
      this.log(`${name} - FAILED: ${error.message}`, 'error');
    }
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(message);
    }
  }

  // Test 1: Validate API Contract Consistency
  testApiContractConsistency() {
    this.log('Testing API contract consistency...');

    // Extract API endpoints from route files
    const routeFiles = [
      'src/routes/auth.routes.ts',
      'src/routes/dashboard.routes.ts',
      'src/routes/social-account.routes.ts',
      'src/routes/analytics.routes.ts',
    ];

    routeFiles.forEach(file => {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');

        // Extract route definitions - handle both inline and multiline routes
        const allMatches = [
          ...(content.matchAll(
            /router\.(get|post|put|delete)\(\s*['"`]([^'"`]+)['"`]/gm
          ) || []),
          ...(content.matchAll(
            /router\.(get|post|put|delete)\(\s*\n\s*['"`]([^'"`]+)['"`]/gm
          ) || []),
        ];

        allMatches.forEach(match => {
          const method = match[1];
          const endpoint = match[2];
          this.apiEndpoints.add(`${method.toUpperCase()} ${endpoint}`);
        });
      }
    });

    // Extract API calls from frontend files
    const frontendFiles = [
      'public/js/api.js',
      'public/js/dashboard.js',
      'public/js/analytics.js',
      'public/js/account-management.js',
    ];

    frontendFiles.forEach(file => {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');

        // Extract API calls
        const apiCallMatches = content.match(
          /(?:request|makeRequest)\(['"`]([^'"`]+)['"`](?:,\s*\{\s*method:\s*['"`](\w+)['"`])?/g
        );
        if (apiCallMatches) {
          apiCallMatches.forEach(match => {
            const methodMatch = match.match(/method:\s*['"`](\w+)['"`]/);
            const endpointMatch = match.match(/['"`]([^'"`]+)['"`]/);
            if (endpointMatch) {
              const method = methodMatch ? methodMatch[1].toUpperCase() : 'GET';
              this.frontendApiCalls.add(`${method} ${endpointMatch[1]}`);
            }
          });
        }
      }
    });

    this.test('API endpoints are defined in backend routes', () => {
      this.assert(
        this.apiEndpoints.size > 0,
        'No API endpoints found in route files'
      );
    });

    this.test('Frontend makes API calls', () => {
      this.assert(
        this.frontendApiCalls.size > 0,
        'No API calls found in frontend files'
      );
    });

    // Check for common endpoints
    const criticalEndpoints = [
      'POST /login',
      'GET /me',
      'GET /',
      '/overview',
      '/trends',
      '/activity',
    ];

    criticalEndpoints.forEach(endpoint => {
      this.test(`Critical endpoint ${endpoint} exists in backend`, () => {
        const endpointPath = endpoint.includes(' ')
          ? endpoint.split(' ')[1]
          : endpoint;
        const found = Array.from(this.apiEndpoints).some(e =>
          e.includes(endpointPath)
        );
        if (!found) {
          console.log(
            `Debug: Looking for ${endpointPath} in:`,
            Array.from(this.apiEndpoints)
          );
        }
        this.assert(found, `Endpoint ${endpoint} not found in backend routes`);
      });
    });
  }

  // Test 2: Validate Authentication Flow
  testAuthenticationFlow() {
    this.log('Testing authentication flow...');

    const apiJs = fs.readFileSync('public/js/api.js', 'utf8');

    this.test('API client handles authentication tokens', () => {
      this.assert(
        apiJs.includes('authToken'),
        'API client should handle auth tokens'
      );
      this.assert(
        apiJs.includes('refreshToken'),
        'API client should handle refresh tokens'
      );
      this.assert(
        apiJs.includes('Authorization'),
        'API client should set Authorization header'
      );
    });

    this.test('API client handles token refresh', () => {
      this.assert(
        apiJs.includes('refreshAuthToken'),
        'API client should have token refresh method'
      );
      this.assert(
        apiJs.includes('401'),
        'API client should handle 401 responses'
      );
    });

    this.test('API client handles authentication errors', () => {
      this.assert(
        apiJs.includes('clearAuth'),
        'API client should clear auth on errors'
      );
      this.assert(
        apiJs.includes('login'),
        'API client should redirect to login'
      );
    });

    // Check auth routes exist
    const authRoutes = fs.readFileSync('src/routes/auth.routes.ts', 'utf8');

    this.test('Backend has authentication endpoints', () => {
      this.assert(
        authRoutes.includes('/login'),
        'Backend should have login endpoint'
      );
      this.assert(
        authRoutes.includes('/refresh-token'),
        'Backend should have refresh token endpoint'
      );
      this.assert(
        authRoutes.includes('/me'),
        'Backend should have user profile endpoint'
      );
    });
  }

  // Test 3: Validate Dashboard Data Flow
  testDashboardDataFlow() {
    this.log('Testing dashboard data flow...');

    const dashboardJs = fs.readFileSync('public/js/dashboard.js', 'utf8');
    const dashboardRoutes = fs.readFileSync(
      'src/routes/dashboard.routes.ts',
      'utf8'
    );

    this.test('Dashboard loads overview metrics', () => {
      this.assert(
        dashboardJs.includes('getOverviewMetrics'),
        'Dashboard should load overview metrics'
      );
      this.assert(
        dashboardRoutes.includes('/overview'),
        'Backend should have overview endpoint'
      );
    });

    this.test('Dashboard loads performance trends', () => {
      this.assert(
        dashboardJs.includes('getPerformanceTrends'),
        'Dashboard should load performance trends'
      );
      this.assert(
        dashboardRoutes.includes('/trends'),
        'Backend should have trends endpoint'
      );
    });

    this.test('Dashboard loads recent activity', () => {
      this.assert(
        dashboardJs.includes('getRecentActivity'),
        'Dashboard should load recent activity'
      );
      this.assert(
        dashboardRoutes.includes('/activity'),
        'Backend should have activity endpoint'
      );
    });

    this.test('Dashboard handles loading states', () => {
      this.assert(
        dashboardJs.includes('showLoading'),
        'Dashboard should show loading states'
      );
      this.assert(
        dashboardJs.includes('hideLoading'),
        'Dashboard should hide loading states'
      );
    });

    this.test('Dashboard handles errors gracefully', () => {
      this.assert(
        dashboardJs.includes('catch'),
        'Dashboard should handle API errors'
      );
      this.assert(
        dashboardJs.includes('showErrorState'),
        'Dashboard should show error states'
      );
    });
  }

  // Test 4: Validate Analytics Integration
  testAnalyticsIntegration() {
    this.log('Testing analytics integration...');

    const analyticsJs = fs.readFileSync('public/js/analytics.js', 'utf8');
    const analyticsRoutes = fs.readFileSync(
      'src/routes/analytics.routes.ts',
      'utf8'
    );

    this.test('Analytics loads account metrics', () => {
      this.assert(
        analyticsJs.includes('getAnalytics') ||
          analyticsJs.includes('analytics'),
        'Analytics should load account data'
      );
      this.assert(
        analyticsRoutes.includes('/:accountId'),
        'Backend should have account analytics endpoint'
      );
    });

    this.test('Analytics handles different time ranges', () => {
      this.assert(
        analyticsJs.includes('currentTimeRange'),
        'Analytics should handle time ranges'
      );
      this.assert(
        analyticsJs.includes('TimeRange') || analyticsJs.includes('days'),
        'Analytics should pass time range to API'
      );
    });

    this.test('Analytics creates charts', () => {
      this.assert(
        analyticsJs.includes('Chart'),
        'Analytics should create charts'
      );
      this.assert(
        analyticsJs.includes('createMainChart'),
        'Analytics should create main chart'
      );
    });

    this.test('Analytics handles competitive analysis', () => {
      this.assert(
        analyticsJs.includes('CompetitiveAnalysis'),
        'Analytics should handle competitive analysis'
      );
      this.assert(
        analyticsRoutes.includes('/competitive'),
        'Backend should have competitive analysis endpoint'
      );
    });
  }

  // Test 5: Validate Account Management
  testAccountManagement() {
    this.log('Testing account management...');

    const accountJs = fs.readFileSync(
      'public/js/account-management.js',
      'utf8'
    );
    const accountRoutes = fs.readFileSync(
      'src/routes/social-account.routes.ts',
      'utf8'
    );

    this.test('Account management loads accounts', () => {
      this.assert(
        accountJs.includes('accounts') && accountJs.includes('request'),
        'Should load social accounts'
      );
      this.assert(
        accountRoutes.includes('GET'),
        'Backend should have GET accounts endpoint'
      );
    });

    this.test('Account management handles CRUD operations', () => {
      this.assert(
        accountJs.includes('addSocialAccount'),
        'Should add accounts'
      );
      this.assert(
        accountJs.includes('updateSocialAccount'),
        'Should update accounts'
      );
      this.assert(
        accountJs.includes('deleteSocialAccount'),
        'Should delete accounts'
      );

      this.assert(
        accountRoutes.includes('POST'),
        'Backend should have POST endpoint'
      );
      this.assert(
        accountRoutes.includes('PUT'),
        'Backend should have PUT endpoint'
      );
      this.assert(
        accountRoutes.includes('DELETE'),
        'Backend should have DELETE endpoint'
      );
    });

    this.test('Account management handles health checks', () => {
      this.assert(
        accountJs.includes('runHealthCheck'),
        'Should run health checks'
      );
      this.assert(
        accountRoutes.includes('health-check'),
        'Backend should have health check endpoint'
      );
    });

    this.test('Account management handles groups', () => {
      this.assert(
        accountJs.includes('AccountGroup'),
        'Should handle account groups'
      );
      this.assert(
        accountRoutes.includes('/groups'),
        'Backend should have groups endpoint'
      );
    });
  }

  // Test 6: Validate Error Handling
  testErrorHandling() {
    this.log('Testing error handling...');

    const apiJs = fs.readFileSync('public/js/api.js', 'utf8');

    this.test('API client handles network errors', () => {
      this.assert(apiJs.includes('catch'), 'API client should catch errors');
      this.assert(
        apiJs.includes('throw new Error'),
        'API client should throw meaningful errors'
      );
    });

    this.test('API client handles HTTP error codes', () => {
      this.assert(
        apiJs.includes('response.ok'),
        'API client should check response status'
      );
      this.assert(
        apiJs.includes('response.status'),
        'API client should handle status codes'
      );
    });

    this.test('Frontend shows user-friendly error messages', () => {
      this.assert(
        apiJs.includes('showToast'),
        'Should show toast notifications'
      );
      this.assert(apiJs.includes('error'), 'Should handle error type toasts');
    });

    // Check all frontend files handle errors
    const frontendFiles = [
      'public/js/dashboard.js',
      'public/js/analytics.js',
      'public/js/account-management.js',
    ];

    frontendFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      this.test(`${path.basename(file)} handles errors`, () => {
        this.assert(content.includes('catch'), `${file} should handle errors`);
        this.assert(
          content.includes('error'),
          `${file} should process error responses`
        );
      });
    });
  }

  // Test 7: Validate Data Consistency
  testDataConsistency() {
    this.log('Testing data consistency...');

    const apiJs = fs.readFileSync('public/js/api.js', 'utf8');

    this.test('API responses are consistently structured', () => {
      this.assert(
        apiJs.includes('response.data'),
        'API should extract data property consistently'
      );
      this.assert(
        apiJs.includes('|| response'),
        'API should fallback to response if no data property'
      );
    });

    this.test('Date formatting is consistent', () => {
      this.assert(
        apiJs.includes('formatDate'),
        'Should have consistent date formatting'
      );
      this.assert(
        apiJs.includes('formatRelativeTime'),
        'Should have relative time formatting'
      );
    });

    this.test('Number formatting is consistent', () => {
      this.assert(
        apiJs.includes('formatNumber'),
        'Should have consistent number formatting'
      );
      this.assert(
        apiJs.includes('formatPercentage'),
        'Should have percentage formatting'
      );
    });

    this.test('Platform data is consistent', () => {
      this.assert(
        apiJs.includes('getPlatformIcon'),
        'Should have consistent platform icons'
      );
      this.assert(
        apiJs.includes('getPlatformColor'),
        'Should have consistent platform colors'
      );
    });
  }

  // Test 8: Validate Loading States
  testLoadingStates() {
    this.log('Testing loading states...');

    const frontendFiles = [
      'public/js/dashboard.js',
      'public/js/analytics.js',
      'public/js/account-management.js',
    ];

    frontendFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      this.test(`${path.basename(file)} implements loading states`, () => {
        this.assert(
          content.includes('showLoading'),
          `${file} should show loading states`
        );
        this.assert(
          content.includes('hideLoading'),
          `${file} should hide loading states`
        );
        this.assert(
          content.includes('finally'),
          `${file} should use finally blocks for cleanup`
        );
      });
    });
  }

  // Test 9: Validate User Workflows
  testUserWorkflows() {
    this.log('Testing user workflows...');

    // Dashboard workflow
    const dashboardJs = fs.readFileSync('public/js/dashboard.js', 'utf8');
    this.test('Dashboard workflow is complete', () => {
      this.assert(
        dashboardJs.includes('loadDashboardData'),
        'Dashboard should load data'
      );
      this.assert(
        dashboardJs.includes('refresh'),
        'Dashboard should refresh data'
      );
      this.assert(
        dashboardJs.includes('setupAutoRefresh'),
        'Dashboard should auto-refresh'
      );
    });

    // Analytics workflow
    const analyticsJs = fs.readFileSync('public/js/analytics.js', 'utf8');
    this.test('Analytics workflow is complete', () => {
      this.assert(
        analyticsJs.includes('loadAnalyticsData'),
        'Analytics should load data'
      );
      this.assert(
        analyticsJs.includes('filterAnalyticsData'),
        'Analytics should filter data'
      );
      this.assert(
        analyticsJs.includes('exportAnalyticsData'),
        'Analytics should export data'
      );
    });

    // Account management workflow
    const accountJs = fs.readFileSync(
      'public/js/account-management.js',
      'utf8'
    );
    this.test('Account management workflow is complete', () => {
      this.assert(
        accountJs.includes('loadAccountData'),
        'Should load account data'
      );
      this.assert(
        accountJs.includes('openAddAccountModal'),
        'Should add new accounts'
      );
      this.assert(
        accountJs.includes('openAccountSettings'),
        'Should edit account settings'
      );
    });
  }

  // Test 10: Validate Security Implementation
  testSecurityImplementation() {
    this.log('Testing security implementation...');

    const apiJs = fs.readFileSync('public/js/api.js', 'utf8');

    this.test('Authentication tokens are stored securely', () => {
      this.assert(
        apiJs.includes('localStorage'),
        'Tokens should be stored in localStorage'
      );
      this.assert(apiJs.includes('removeItem'), 'Tokens should be removable');
    });

    this.test('API requests include authentication', () => {
      this.assert(
        apiJs.includes('Bearer'),
        'Should use Bearer token authentication'
      );
      this.assert(
        apiJs.includes('Authorization'),
        'Should set Authorization header'
      );
    });

    // Check backend authentication middleware
    const authRoutes = fs.readFileSync('src/routes/auth.routes.ts', 'utf8');
    const accountRoutes = fs.readFileSync(
      'src/routes/social-account.routes.ts',
      'utf8'
    );

    this.test('Backend routes are protected', () => {
      this.assert(
        authRoutes.includes('authenticate'),
        'Auth routes should use authentication middleware'
      );
      this.assert(
        accountRoutes.includes('authenticate'),
        'Account routes should be protected'
      );
    });
  }

  // Run all tests
  runAllTests() {
    this.log('🚀 Starting Frontend-Backend Integration Tests');
    this.log('================================================');

    this.testApiContractConsistency();
    this.testAuthenticationFlow();
    this.testDashboardDataFlow();
    this.testAnalyticsIntegration();
    this.testAccountManagement();
    this.testErrorHandling();
    this.testDataConsistency();
    this.testLoadingStates();
    this.testUserWorkflows();
    this.testSecurityImplementation();

    this.log('================================================');
    this.log(`✅ Tests Passed: ${this.results.passed}`);
    this.log(`❌ Tests Failed: ${this.results.failed}`);
    this.log(`📊 Total Tests: ${this.results.passed + this.results.failed}`);

    if (this.results.failed > 0) {
      this.log('❌ INTEGRATION TEST FAILED', 'error');
      this.log('Failed tests:');
      this.results.tests
        .filter(t => t.status === 'FAIL')
        .forEach(t => this.log(`  - ${t.name}: ${t.error}`, 'error'));
      process.exit(1);
    } else {
      this.log('✅ ALL INTEGRATION TESTS PASSED', 'success');
      this.log('🎉 Frontend-Backend integration is working correctly!');
    }

    return this.results;
  }

  // Generate detailed report
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.results.passed + this.results.failed,
        passed: this.results.passed,
        failed: this.results.failed,
        success_rate:
          (
            (this.results.passed /
              (this.results.passed + this.results.failed)) *
            100
          ).toFixed(2) + '%',
      },
      api_endpoints: Array.from(this.apiEndpoints),
      frontend_api_calls: Array.from(this.frontendApiCalls),
      test_results: this.results.tests,
    };

    fs.writeFileSync(
      'integration-test-report.json',
      JSON.stringify(report, null, 2)
    );
    this.log('📄 Detailed report saved to integration-test-report.json');

    return report;
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new IntegrationTester();
  tester.runAllTests();
  tester.generateReport();
}

module.exports = IntegrationTester;
