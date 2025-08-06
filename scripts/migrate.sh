#!/bin/bash

# Database migration script

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

# Default values
COMMAND=${1:-"up"}
MIGRATION_NAME=$2
ENV=${NODE_ENV:-"dev"}

# Display help if requested
if [ "$COMMAND" == "help" ]; then
  echo "Database Migration Script"
  echo "Usage: ./scripts/migrate.sh [command] [migration_name]"
  echo ""
  echo "Commands:"
  echo "  up           - Run all pending migrations (default)"
  echo "  down         - Revert the last migration"
  echo "  create       - Create a new migration file (requires migration_name)"
  echo "  status       - Show migration status"
  echo "  help         - Show this help message"
  echo ""
  echo "Examples:"
  echo "  ./scripts/migrate.sh up"
  echo "  ./scripts/migrate.sh down"
  echo "  ./scripts/migrate.sh create add_user_roles"
  echo "  ./scripts/migrate.sh status"
  exit 0
fi

# Check if migration name is provided for create command
if [ "$COMMAND" == "create" ] && [ -z "$MIGRATION_NAME" ]; then
  echo "Error: Migration name is required for create command"
  echo "Usage: ./scripts/migrate.sh create <migration_name>"
  exit 1
fi

# Set up command arguments
ARGS=""
if [ "$COMMAND" == "create" ]; then
  ARGS="$MIGRATION_NAME"
fi

# Handle status command differently
if [ "$COMMAND" == "status" ]; then
  echo "Checking migration status..."
  npx node-pg-migrate --migrations-dir=migrations --config-file=database/database.json -m "$ENV" up 0
  exit $?
fi

# Run the migration command
echo "Running migration command: $COMMAND $ARGS (environment: $ENV)"
npx node-pg-migrate --migrations-dir=migrations --config-file=database/database.json -m "$ENV" "$COMMAND" $ARGS

# Check exit status
if [ $? -eq 0 ]; then
  echo "Migration command completed successfully"
else
  echo "Migration command failed"
  exit 1
fi