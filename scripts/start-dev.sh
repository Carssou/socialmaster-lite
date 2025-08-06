#!/bin/bash

# Start development server with database setup and migrations

# Load environment variables
if [ -f .env ]; then
  # Load all environment variables
  set -a
  source .env
  set +a
fi

# Check if Docker is running
echo "Checking if Docker is running..."
if ! docker info > /dev/null 2>&1; then
  echo "Docker is not running. Please start Docker and try again."
  exit 1
fi

# Check if PostgreSQL container is running
echo "Checking if PostgreSQL container is running..."
if ! docker ps | grep -q "postgres"; then
  echo "PostgreSQL container is not running. Starting Docker services..."
  npm run docker:up
  
  # Wait for PostgreSQL to be ready
  echo "Waiting for PostgreSQL to be ready..."
  sleep 5
  
  # Check if PostgreSQL is ready
  MAX_RETRIES=30
  RETRY_COUNT=0
  
  while ! docker exec -it socialmaster-postgres-1 pg_isready -U postgres > /dev/null 2>&1; do
    RETRY_COUNT=$((RETRY_COUNT+1))
    if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
      echo "PostgreSQL is not ready after $MAX_RETRIES retries. Exiting."
      exit 1
    fi
    echo "Waiting for PostgreSQL to be ready... ($RETRY_COUNT/$MAX_RETRIES)"
    sleep 2
  done
  
  echo "PostgreSQL is ready!"
fi

# Check if database exists
echo "Checking if database exists..."
if ! docker exec -it socialmaster-postgres-1 psql -U postgres -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
  echo "Database $DB_NAME does not exist. Creating..."
  docker exec -it socialmaster-postgres-1 psql -U postgres -c "CREATE DATABASE $DB_NAME;"
  echo "Database created successfully!"
  
  # Set up DATABASE_URL for migrations
  export DATABASE_URL="postgres://$DB_USER:$DB_PASSWORD@localhost:$DB_PORT/$DB_NAME"

  # Run database migrations
  echo "Running database migrations..."
  npx node-pg-migrate up --migrations-dir=migrations

  # Check if migrations were successful
  if [ $? -ne 0 ]; then
    echo "Database migrations failed. Exiting."
    exit 1
  fi

  echo "Database setup and migrations completed successfully!"
else
  echo "Database $DB_NAME already exists. Skipping migrations."
fi

# Start the development server
echo "Starting development server..."
npx ts-node-dev --respawn --transpile-only src/index.ts