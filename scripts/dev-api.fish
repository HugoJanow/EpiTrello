#!/usr/bin/env fish

# Load environment variables from .env file
set -gx DATABASE_URL "postgresql://epitrello:epitrello@localhost:5434/epitrello"
set -gx JWT_SECRET "development-jwt-secret-change-in-production-min-32-chars"
set -gx JWT_REFRESH_SECRET "development-refresh-secret-change-in-production-min-32-chars"
set -gx PORT "3001"
set -gx NODE_ENV "development"
set -gx PORT "8001"
set -gx NODE_ENV "development"
set -gx CORS_ORIGIN "http://localhost:8000"

# Start API
pnpm --filter @epitrello/api dev
