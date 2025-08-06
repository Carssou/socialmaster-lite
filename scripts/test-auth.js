#!/usr/bin/env node

/**
 * Manual test script for authentication endpoints
 *
 * Usage:
 *   node scripts/test-auth.js
 */

const axios = require('axios');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Configuration
const API_URL = 'http://localhost:3000/api/v1';
let authToken = null;
let refreshToken = null;
let testEmail = `test-${Date.now()}@example.com`;
const testPassword = 'Password123!';

// Helper to prompt for input
const prompt = question => {
  return new Promise(resolve => {
    rl.question(question, answer => {
      resolve(answer);
    });
  });
};

// Helper to make API requests
const apiRequest = async (method, endpoint, data = null, token = null) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    console.log(`Making ${method.toUpperCase()} request to ${endpoint}`);
    if (token) {
      console.log(`Using token: ${token.substring(0, 15)}...`);
    }

    const response = await axios({
      method,
      url: `${API_URL}${endpoint}`,
      data,
      headers,
    });

    return response.data;
  } catch (error) {
    console.error('API Request Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error(
        'Response data:',
        JSON.stringify(error.response.data, null, 2)
      );
      return error.response.data;
    }
    throw error;
  }
};

// Test registration
const testRegistration = async () => {
  console.log('\n--- Testing User Registration ---');
  console.log(`Using email: ${testEmail}`);

  const userData = {
    email: testEmail,
    password: testPassword,
    name: 'Test User',
  };

  const result = await apiRequest('post', '/auth/register', userData);
  console.log('Registration result:', JSON.stringify(result, null, 2));

  if (result.success && result.data) {
    authToken = result.data.token;
    refreshToken = result.data.refreshToken;
    console.log('✅ Registration successful');
    console.log('Auth token:', authToken.substring(0, 15) + '...');
    console.log('Refresh token:', refreshToken.substring(0, 15) + '...');
  } else {
    console.log('❌ Registration failed');
  }
};

// Test login
const testLogin = async () => {
  console.log('\n--- Testing User Login ---');

  const email = await prompt('Enter email: ');
  const password = await prompt('Enter password: ');

  const loginData = {
    email: email || testEmail,
    password: password || testPassword,
  };

  const result = await apiRequest('post', '/auth/login', loginData);
  console.log('Login result:', JSON.stringify(result, null, 2));

  if (result.success && result.data) {
    authToken = result.data.token;
    refreshToken = result.data.refreshToken;
    console.log('✅ Login successful');
    console.log('Auth token:', authToken.substring(0, 15) + '...');
    console.log('Refresh token:', refreshToken.substring(0, 15) + '...');
  } else {
    console.log('❌ Login failed');
  }
};

// Test getting user profile
const testGetProfile = async () => {
  console.log('\n--- Testing Get User Profile ---');

  if (!authToken) {
    console.log('❌ No auth token available. Login first.');
    return;
  }

  const result = await apiRequest('get', '/auth/profile', null, authToken);
  console.log('Profile result:', JSON.stringify(result, null, 2));

  if (result.success && result.data) {
    console.log('✅ Profile retrieval successful');
  } else {
    console.log('❌ Profile retrieval failed');
  }
};

// Test token refresh
const testRefreshToken = async () => {
  console.log('\n--- Testing Token Refresh ---');

  if (!refreshToken) {
    console.log('❌ No refresh token available. Login first.');
    return;
  }

  const result = await apiRequest('post', '/auth/refresh-token', {
    refreshToken,
  });
  console.log('Token refresh result:', JSON.stringify(result, null, 2));

  if (result.success && result.data) {
    authToken = result.data.token;
    refreshToken = result.data.refreshToken;
    console.log('✅ Token refresh successful');
    console.log('New auth token:', authToken.substring(0, 15) + '...');
    console.log('New refresh token:', refreshToken.substring(0, 15) + '...');
  } else {
    console.log('❌ Token refresh failed');
  }
};

// Main menu
const showMenu = async () => {
  console.log('\n=== Authentication Test Menu ===');
  console.log('1. Register new user');
  console.log('2. Login');
  console.log('3. Get user profile');
  console.log('4. Refresh token');
  console.log('5. Change test email');
  console.log('6. Exit');

  const choice = await prompt('\nEnter your choice (1-6): ');

  switch (choice) {
    case '1':
      await testRegistration();
      break;
    case '2':
      await testLogin();
      break;
    case '3':
      await testGetProfile();
      break;
    case '4':
      await testRefreshToken();
      break;
    case '5':
      testEmail = await prompt('Enter new test email: ');
      console.log(`Test email updated to: ${testEmail}`);
      break;
    case '6':
      console.log('Exiting...');
      rl.close();
      return false;
    default:
      console.log('Invalid choice. Please try again.');
  }

  return true;
};

// Main function
const main = async () => {
  console.log('=== Authentication API Test Script ===');
  console.log(`API URL: ${API_URL}`);

  let continueRunning = true;
  while (continueRunning) {
    continueRunning = await showMenu();
  }
};

// Run the script
main().catch(error => {
  console.error('Error:', error.message);
  rl.close();
});
