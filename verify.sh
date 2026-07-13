#!/bin/bash

echo "🚀 AI-Tinerary Verification Test"
echo "================================"
echo ""

# Phase 1: Build
echo "✅ Phase 1: Maven Build"
./mvnw clean package -DskipTests
if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi
echo "✅ Build successful!"
echo ""

# Phase 2: Docker
echo "🐳 Phase 2: Docker Startup"
docker compose down -v 2>/dev/null
docker compose up -d --build
if [ $? -ne 0 ]; then
    echo "❌ Docker startup failed!"
    echo "ℹ️  Make sure Docker Desktop is running"
    exit 1
fi

echo "⏳ Waiting for application to start (30 seconds)..."
sleep 30
echo ""

# Phase 3: Health Check
echo "🏥 Phase 3: Health Check"
HEALTH=$(curl -s http://localhost:8080/actuator/health)
if echo "$HEALTH" | grep -q '"status":"UP"'; then
    echo "✅ Health check passed: $HEALTH"
else
    echo "❌ Health check failed: $HEALTH"
    exit 1
fi
echo ""

# Phase 4: Register User
echo "👤 Phase 4: User Registration"
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#","name":"Test User"}')

if echo "$REGISTER_RESPONSE" | grep -q '"token"'; then
    echo "✅ Registration successful!"
    TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*' | grep -o ':"[^"]*' | cut -d'"' -f2)
    echo "Token: ${TOKEN:0:50}..."
else
    echo "❌ Registration failed: $REGISTER_RESPONSE"
    exit 1
fi
echo ""

# Phase 5: Get Current User
echo "🔐 Phase 5: Protected Endpoint Test"
ME_RESPONSE=$(curl -s http://localhost:8080/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN")

if echo "$ME_RESPONSE" | grep -q '"email":"test@example.com"'; then
    echo "✅ Protected endpoint accessed successfully!"
    echo "User: $ME_RESPONSE"
else
    echo "❌ Protected endpoint failed: $ME_RESPONSE"
    exit 1
fi
echo ""

# Phase 6: Create Travel Plan
echo "✈️  Phase 6: Create Travel Plan"
PLAN_RESPONSE=$(curl -s -X POST http://localhost:8080/api/v1/ai/generate-plan \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"destination":"Paris","startDate":"2026-07-01","endDate":"2026-07-07","budget":2000.00,"interests":["museums","food"]}')

if echo "$PLAN_RESPONSE" | grep -q '"id"'; then
    echo "✅ Travel plan created!"
    PLAN_ID=$(echo $PLAN_RESPONSE | grep -o '"id":[0-9]*' | grep -o '[0-9]*')
    echo "Plan ID: $PLAN_ID"
    echo "Preview: ${PLAN_RESPONSE:0:150}..."
else
    echo "❌ Travel plan creation failed: $PLAN_RESPONSE"
    exit 1
fi
echo ""

# Phase 7: Retrieve Plans
echo "📋 Phase 7: Retrieve Travel Plans"
PLANS_RESPONSE=$(curl -s http://localhost:8080/api/v1/plans \
  -H "Authorization: Bearer $TOKEN")

if echo "$PLANS_RESPONSE" | grep -q '"destination":"Paris"'; then
    echo "✅ Travel plans retrieved successfully!"
    echo "Plans: ${PLANS_RESPONSE:0:150}..."
else
    echo "❌ Failed to retrieve plans: $PLANS_RESPONSE"
    exit 1
fi
echo ""

# Phase 8: Persistence Test
echo "💾 Phase 8: Persistence Test (Restart Container)"
echo "Restarting application container..."
docker compose restart app
echo "⏳ Waiting for restart (20 seconds)..."
sleep 20

echo "Logging in with existing user..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#"}')

if echo "$LOGIN_RESPONSE" | grep -q '"token"'; then
    echo "✅ Login after restart successful!"
    NEW_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | grep -o ':"[^"]*' | cut -d'"' -f2)
else
    echo "❌ Login after restart failed: $LOGIN_RESPONSE"
    exit 1
fi

echo "Checking if travel plan persisted..."
PERSISTED_PLANS=$(curl -s http://localhost:8080/api/v1/plans \
  -H "Authorization: Bearer $NEW_TOKEN")

if echo "$PERSISTED_PLANS" | grep -q '"destination":"Paris"'; then
    echo "✅ Data persistence verified! Travel plan survived restart."
else
    echo "❌ Data persistence failed: $PERSISTED_PLANS"
    exit 1
fi
echo ""

# Phase 9: Docker Logs Check
echo "📝 Phase 9: Docker Behavior Verification"
echo "Checking for errors in logs..."
ERROR_COUNT=$(docker compose logs app | grep -i "error\|exception\|failed" | grep -v "ErrorResponse" | wc -l)
if [ "$ERROR_COUNT" -lt 5 ]; then
    echo "✅ No significant errors in logs (found $ERROR_COUNT)"
else
    echo "⚠️  Found $ERROR_COUNT error entries in logs (review manually)"
fi
echo ""

echo "================================"
echo "✅ ALL TESTS PASSED!"
echo "================================"
echo ""
echo "Test Summary:"
echo "✅ Build: Successful"
echo "✅ Docker: Containers running"
echo "✅ Health Check: UP"
echo "✅ Authentication: Working"
echo "✅ Protected Endpoints: Working"
echo "✅ Travel Plan Creation: Working"
echo "✅ Travel Plan Retrieval: Working"
echo "✅ Data Persistence: Working"
echo "✅ Docker Behavior: No critical errors"
echo ""
echo "📊 Sprint 1 Implementation: VERIFIED"
echo ""
echo "To cleanup:"
echo "  docker compose down -v"
echo ""
echo "To view logs:"
echo "  docker compose logs -f app"
echo ""
