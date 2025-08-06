#!/bin/bash

# Run Jest tests with coverage
echo "Running tests with coverage..."
npx jest --coverage

# Check exit code
if [ $? -eq 0 ]; then
  echo "✅ All tests passed!"
else
  echo "❌ Tests failed!"
  exit 1
fi