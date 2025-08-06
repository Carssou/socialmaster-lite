#!/bin/bash

# Script to test authentication endpoints using curl

# Set colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Set API URL
API_URL="http://localhost:3000/api/v1"

# Generate a unique test email
TEST_EMAIL="test-$(date +%s)@example.com"
TEST_PASSWORD="Password123!"
TEST_NAME="Test User"

# Variables to store tokens
AUTH_TOKEN=""
REFRESH_TOKEN=""

echo -e "${YELLOW}=== Testing Authentication API with curl ===${NC}"
echo -e "API URL: ${API_URL}"
echo -e "Test Email: ${TEST_EMAIL}\n"

# Test registration
echo -e "${YELLOW}Testing registration...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "${API_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${TEST_EMAIL}\",\"password\":\"${TEST_PASSWORD}\",\"name\":\"${TEST_NAME}\"}")

echo -e "Response: ${REGISTER_RESPONSE}\n"

# Extract tokens from registration response
if echo "${REGISTER_RESPONSE}" | grep -q "\"success\":true"; then
  echo -e "${GREEN}Registration successful${NC}"
  AUTH_TOKEN=$(echo "${REGISTER_RESPONSE}" | grep -o '"token":"[^"]*' | sed 's/"token":"//')
  REFRESH_TOKEN=$(echo "${REGISTER_RESPONSE}" | grep -o '"refreshToken":"[^"]*' | sed 's/"refreshToken":"//')
  
  echo -e "Auth Token: ${AUTH_TOKEN:0:15}..."
  echo -e "Refresh Token: ${REFRESH_TOKEN:0:15}...\n"
else
  echo -e "${RED}Registration failed${NC}\n"
fi

# Test login
echo -e "${YELLOW}Testing login...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${TEST_EMAIL}\",\"password\":\"${TEST_PASSWORD}\"}")

echo -e "Response: ${LOGIN_RESPONSE}\n"

# Extract tokens from login response
if echo "${LOGIN_RESPONSE}" | grep -q "\"success\":true"; then
  echo -e "${GREEN}Login successful${NC}"
  AUTH_TOKEN=$(echo "${LOGIN_RESPONSE}" | grep -o '"token":"[^"]*' | sed 's/"token":"//')
  REFRESH_TOKEN=$(echo "${LOGIN_RESPONSE}" | grep -o '"refreshToken":"[^"]*' | sed 's/"refreshToken":"//')
  
  echo -e "Auth Token: ${AUTH_TOKEN:0:15}..."
  echo -e "Refresh Token: ${REFRESH_TOKEN:0:15}...\n"
else
  echo -e "${RED}Login failed${NC}\n"
fi

# Test get profile
echo -e "${YELLOW}Testing get profile...${NC}"
PROFILE_RESPONSE=$(curl -s -X GET "${API_URL}/auth/profile" \
  -H "Authorization: Bearer ${AUTH_TOKEN}")

echo -e "Response: ${PROFILE_RESPONSE}\n"

if echo "${PROFILE_RESPONSE}" | grep -q "\"success\":true"; then
  echo -e "${GREEN}Profile retrieval successful${NC}\n"
else
  echo -e "${RED}Profile retrieval failed${NC}\n"
fi

# Test refresh token
echo -e "${YELLOW}Testing refresh token...${NC}"
REFRESH_RESPONSE=$(curl -s -X POST "${API_URL}/auth/refresh-token" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"${REFRESH_TOKEN}\"}")

echo -e "Response: ${REFRESH_RESPONSE}\n"

if echo "${REFRESH_RESPONSE}" | grep -q "\"success\":true"; then
  echo -e "${GREEN}Token refresh successful${NC}"
  AUTH_TOKEN=$(echo "${REFRESH_RESPONSE}" | grep -o '"token":"[^"]*' | sed 's/"token":"//')
  REFRESH_TOKEN=$(echo "${REFRESH_RESPONSE}" | grep -o '"refreshToken":"[^"]*' | sed 's/"refreshToken":"//')
  
  echo -e "New Auth Token: ${AUTH_TOKEN:0:15}..."
  echo -e "New Refresh Token: ${REFRESH_TOKEN:0:15}...\n"
else
  echo -e "${RED}Token refresh failed${NC}\n"
fi

# Test profile again with new token
echo -e "${YELLOW}Testing profile with new token...${NC}"
PROFILE_RESPONSE=$(curl -s -X GET "${API_URL}/auth/profile" \
  -H "Authorization: Bearer ${AUTH_TOKEN}")

echo -e "Response: ${PROFILE_RESPONSE}\n"

if echo "${PROFILE_RESPONSE}" | grep -q "\"success\":true"; then
  echo -e "${GREEN}Profile retrieval with new token successful${NC}\n"
else
  echo -e "${RED}Profile retrieval with new token failed${NC}\n"
fi

echo -e "${GREEN}All tests completed!${NC}"