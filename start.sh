#!/bin/bash

echo "=============================================="
echo "AI-Tinerary Application Startup"
echo "=============================================="
echo ""

echo "Loading environment variables from .env.local..."
if [ ! -f .env.local ]; then
    echo "ERROR: .env.local file not found!"
    echo "Please create .env.local file with required environment variables."
    exit 1
fi

source .env.local

echo "✅ Environment variables loaded"
echo ""
echo "Configuration:"
echo "  GEMINI_API_KEY: ${GEMINI_API_KEY:0:10}... (${#GEMINI_API_KEY} chars)"
echo "  GEMINI_MODEL: ${GEMINI_MODEL:-gemini-3.5-flash (default)}"
echo "  DB_HOST: $DB_HOST"
echo "  DB_USERNAME: $DB_USERNAME"
echo "  DB_NAME: $DB_NAME"
echo ""

echo "Starting Spring Boot application..."
echo "=============================================="
echo ""

./mvnw spring-boot:run
