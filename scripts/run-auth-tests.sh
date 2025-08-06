#!/bin/bash

# Script to run authentication tests

# Set colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Running Authentication Tests ===${NC}"

# Check if server is running
echo -e "\n${YELLOW}Checking if server is running...${NC}"
if curl -s http://localhost:3000/health > /dev/null; then
  echo -e "${GREEN}Server is running${NC}"
else
  echo -e "${RED}Server is not running. Please start the server first.${NC}"
  echo -e "Run: ${YELLOW}npm run dev${NC}"
  exit 1
fi

# Run unit tests
echo -e "\n${YELLOW}Running unit tests...${NC}"
npm test -- --testPathPattern=auth.test.ts

# Run integration tests
echo -e "\n${YELLOW}Running integration tests...${NC}"
npm test -- --testPathPattern=auth.integration.test.ts

echo -e "\n${YELLOW}=== Manual Testing ===${NC}"
echo -e "You can also test the authentication API manually using:"
echo -e "1. ${GREEN}node scripts/test-auth.js${NC} - Interactive CLI test"
echo -e "2. ${GREEN}Postman${NC} - Import the collection from docs/auth-api-tests.postman_collection.json"
echo -e "3. ${GREEN}curl${NC} - Example commands:"
echo -e "   ${YELLOW}Register:${NC} curl -X POST http://localhost:3000/api/v1/auth/register -H 'Content-Type: application/json' -d '{\"email\":\"test@example.com\",\"password\":\"Password123!\",\"name\":\"Test User\"}'"
echo -e "   ${YELLOW}Login:${NC} curl -X POST http://localhost:3000/api/v1/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"test@example.com\",\"password\":\"Password123!\"}'"
echo -e "   ${YELLOW}Profile:${NC} curl -X GET http://localhost:3000/api/v1/auth/profile -H 'Authorization: Bearer YOUR_TOKEN'"
echo -e "   ${YELLOW}Refresh:${NC} curl -X POST http://localhost:3000/api/v1/auth/refresh-token -H 'Content-Type: application/json' -d '{\"refreshToken\":\"YOUR_REFRESH_TOKEN\"}'"

echo -e "\n${GREEN}Done!${NC}"