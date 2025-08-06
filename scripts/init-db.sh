#!/bin/bash

# Database initialization script for production environments

# Load environment variables
if [ -f .env ]; then
  # Extract only the database-related environment variables
  export DB_HOST=$(grep DB_HOST .env | cut -d '=' -f2)
  export DB_PORT=$(grep DB_PORT .env | cut -d '=' -f2)
  export DB_NAME=$(grep DB_NAME= .env | cut -d '=' -f2)
  export DB_USER=$(grep DB_USER .env | cut -d '=' -f2)
  export DB_PASSWORD=$(grep DB_PASSWORD .env | cut -d '=' -f2)
  export DB_SSL=$(grep DB_SSL .env | cut -d '=' -f2)
  export NODE_ENV=$(grep NODE_ENV .env | cut -d '=' -f2)
fi

# Set up DATABASE_URL for migrations
export DATABASE_URL="postgres://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"

# Run database migrations
echo "Running database migrations..."
npx node-pg-migrate up --migrations-dir=migrations

# Check if migrations were successful
if [ $? -ne 0 ]; then
  echo "Database migrations failed. Exiting."
  exit 1
fi

echo "Database setup and migrations completed successfully!"