#!/usr/bin/env node

/**
 * Integration Test Runner
 * Runs frontend-backend integration tests using Node.js
 */

const fs = require('fs');
const path = require('path');

// Simple test framework
class TestRunner {
  constructor() {
    this.tests = [];
    this.currentSuite = null;
    this.beforeAllFn = null;
    this.afterAllFn = null;
    this.results = {
      passed: 0,
      failed: 0,
      errors: [],
    };
  }

  describe(name, fn) {
    console.log(`\n📋 ${name}`);
    this.currentSuite = name;
    fn();
  }

  test(name, fn) {
    this.tests.push({
      suite: this.currentSuite,
      name,
      fn,
    });
  }

  beforeAll(fn) {
    this.beforeAllFn = fn;
  }

  afterAll(fn) {
    this.afterAllFn = fn;
  }

  expect(actual) {
    return {
      toBe: expected => {
        if (actual !== expected) {
          throw new Error(`Expected ${actual} to be ${expected}`);
        }
      },
      toBeTruthy: () => {
        if (!actual) {
          throw new Error(`Expected ${actual} to be truthy`);
        }
      },
      toHaveProperty: prop => {
        if (
          typeof actual !== 'object' ||
          actual === null ||
          !(prop in actual)
        ) {
          throw new Error(`Expected object to have property ${prop}`);
        }
      },
      toMatchObject: expected => {
        for (const key in expected) {
          if (actual[key] !== expected[key]) {
            throw new Error(
              `Expected ${key} to be ${expected[key]}, got ${actual[key]}`
            );
          }
        }
      },
      toContain: expected => {
        if (typeof actual === 'string' && !actual.includes(expected)) {
          throw new Error(`Expected "${actual}" to contain "${expected}"`);
        }
      },
    };
  }

  fail(message) {
    throw new Error(message);
  }

  async runTests() {
    console.log('🚀 Starting Frontend-Backend Integration Tests\n');

    // Run beforeAll if it exists
    if (this.beforeAllFn) {
      try {
        console.log('  🔧 Running setup...');
        await this.beforeAllFn();
        console.log('    ✅ Setup completed');
      } catch (error) {
        console.log(`    ❌ Setup failed: ${error.message}`);
        return;
      }
    }

    for (const test of this.tests) {
      try {
        console.log(`  ✓ Running: ${test.name}`);
        await test.fn();
        this.results.passed++;
        console.log(`    ✅ PASSED`);
      } catch (error) {
        this.results.failed++;
        this.results.errors.push({
          suite: test.suite,
          test: test.name,
          error: error.message,
        });
        console.log(`    ❌ FAILED: ${error.message}`);
      }
    }

    // Run afterAll if it exists
    if (this.afterAllFn) {
      try {
        console.log('  🧹 Running cleanup...');
        await this.afterAllFn();
        console.log('    ✅ Cleanup completed');
      } catch (error) {
        console.log(`    ⚠️ Cleanup failed: ${error.message}`);
      }
    }

    this.printResults();
  }

  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST RESULTS');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📈 Total: ${this.results.passed + this.results.failed}`);

    if (this.results.errors.length > 0) {
      console.log('\n❌ FAILURES:');
      this.results.errors.forEach((error, index) => {
        console.log(`\n${index + 1}. ${error.suite} - ${error.test}`);
        console.log(`   ${error.error}`);
      });
    }

    console.log('\n' + '='.repeat(60));

    if (this.results.failed === 0) {
      console.log('🎉 All tests passed!');
      process.exit(0);
    } else {
      console.log('💥 Some tests failed!');
      process.exit(1);
    }
  }
}

// Global test functions
global.describe = (name, fn) => testRunner.describe(name, fn);
global.test = (name, fn) => testRunner.test(name, fn);
global.beforeAll = fn => testRunner.beforeAll(fn);
global.afterAll = fn => testRunner.afterAll(fn);
global.expect = actual => testRunner.expect(actual);
global.fail = message => testRunner.fail(message);

// Add fetch polyfill for Node.js
async function setupFetch() {
  const { default: fetch } = await import('node-fetch');
  global.fetch = fetch;
}

// Create test runner instance
const testRunner = new TestRunner();

// Load and run the integration tests
async function runIntegrationTests() {
  try {
    // Setup fetch
    await setupFetch();

    // Check if server is running
    try {
      const response = await fetch('http://localhost:3000/api/v1/health');
      if (!response.ok) {
        throw new Error('Server health check failed');
      }
      console.log('✅ Server is running and healthy');
    } catch (error) {
      console.error('❌ Server is not running or not healthy');
      console.error('Please start the server with: npm run dev');
      process.exit(1);
    }

    // Load the test file
    const testFile = path.join(
      __dirname,
      '../tests/integration/basic-integration.test.js'
    );

    if (!fs.existsSync(testFile)) {
      console.error('❌ Test file not found:', testFile);
      process.exit(1);
    }

    // Execute the test file
    require(testFile);

    // Run all tests
    await testRunner.runTests();
  } catch (error) {
    console.error('❌ Failed to run integration tests:', error);
    process.exit(1);
  }
}

// Run the tests
runIntegrationTests();
