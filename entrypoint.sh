#!/bin/sh

# Run TypeORM migrations
echo "Running migrations..."
npm run migration:run

# Start the NestJS application based on the environment
if [ "$NODE_ENV" = "development" ]; then
  echo "Starting the application in development mode..."
  npm run start:dev
else
  echo "Starting the application in production mode..."
  npm run start:prod
fi