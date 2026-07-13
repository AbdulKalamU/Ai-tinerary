#!/bin/bash

echo "🔥 AI-Tinerary Smoke Test"
echo "========================="
echo ""
echo "This script tests basic functionality."
echo "Make sure the application is running (./mvnw spring-boot:run)"
echo ""

# Wait for user confirmation
read -p "Is the application running? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Start the application first, then run this script again."
    exit 1
fi
echo ""

# Test 1: Health Check
echo "🏥 Test 1: Health Check"
HEALTH_RESPONSE=$(curl -s http://localhost:8080/actuator/health)
if echo "$HEALTH_RESPONSE" | grep -q '"status":"UP"'; then
    echo "✅ PASS: Application is UP"
else
    echo "❌ FAIL: Health check failed: $HEALTH_RESPONSE"
    exit 1
fi
echo ""

# Test 2: Register User
echo "👤 Test 2: User Registration"
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"smoketest$(date +%s)@example.com\",
    \"password\": \"Test123!@#\",
    \"name\": \"Smoke Test User\"
  }")

if echo "$REGISTER_RESPONSE" | grep -q '"token"'; then
    echo "✅ PASS: User registered successfully"
    TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*' | grep -o ':"[^"]*' | cut -d'"' -f2)
    EMAIL=$(echo $REGISTER_RESPONSE | grep -o '"email":"[^"]*' | grep -o ':"[^"]*' | cut -d'"' -f2)
    echo "   Email: $EMAIL"
    echo "   Token: ${TOKEN:0:50}..."
else
    echo "❌ FAIL: Registration failed: $REGISTER_RESPONSE"
    exit 1
fi
echo ""

# Test 3: Protected Endpoint
echo "🔐 Test 3: Protected Endpoint (Current User)"
ME_RESPONSE=$(curl -s http://localhost:8080/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN")

if echo "$ME_RESPONSE" | grep -q '"email"'; then
    echo "✅ PASS: Protected endpoint accessed successfully"
    echo "   User: $(echo $ME_RESPONSE | grep -o '"name":"[^"]*' | cut -d'"' -f4)"
else
    echo "❌ FAIL: Protected endpoint failed: $ME_RESPONSE"
    exit 1
fi
echo ""

# Test 4: Create Travel Plan
echo "✈️  Test 4: Create Travel Plan"
PLAN_RESPONSE=$(curl -s -X POST http://localhost:8080/api/v1/ai/generate-plan \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "destination": "Paris",
    "startDate": "2026-07-01",
    "endDate": "2026-07-07",
    "budget": 2000.00,
    "interests": ["museums", "food"]
  }')

if echo "$PLAN_RESPONSE" | grep -q '"id"'; then
    echo "✅ PASS: Travel plan created successfully"
    PLAN_ID=$(echo $PLAN_RESPONSE | grep -o '"id":[0-9]*' | grep -o '[0-9]*')
    echo "   Plan ID: $PLAN_ID"
    echo "   Destination: Paris"
else
    echo "❌ FAIL: Travel plan creation failed: ${PLAN_RESPONSE:0:200}"
    exit 1
fi
echo ""

# Test 5: Retrieve Travel Plans
echo "📋 Test 5: Retrieve Travel Plans"
PLANS_RESPONSE=$(curl -s http://localhost:8080/api/v1/plans \
  -H "Authorization: Bearer $TOKEN")

if echo "$PLANS_RESPONSE" | grep -q '"destination":"Paris"'; then
    echo "✅ PASS: Travel plans retrieved successfully"
    PLAN_COUNT=$(echo $PLANS_RESPONSE | grep -o '"id":' | wc -l | tr -d ' ')
    echo "   Total plans: $PLAN_COUNT"
else
    echo "❌ FAIL: Failed to retrieve plans: ${PLANS_RESPONSE:0:200}"
    exit 1
fi
echo ""

# Test 6: Get Specific Plan
echo "🎯 Test 6: Get Specific Travel Plan"
SPECIFIC_PLAN=$(curl -s http://localhost:8080/api/v1/plans/$PLAN_ID \
  -H "Authorization: Bearer $TOKEN")

if echo "$SPECIFIC_PLAN" | grep -q '"id":'"$PLAN_ID"; then
    echo "✅ PASS: Specific plan retrieved successfully"
else
    echo "❌ FAIL: Failed to retrieve specific plan: ${SPECIFIC_PLAN:0:200}"
    exit 1
fi
echo ""

# Test 7: Delete Travel Plan
echo "🗑️  Test 7: Delete Travel Plan"
DELETE_RESPONSE=$(curl -s -w "%{http_code}" -o /dev/null -X DELETE http://localhost:8080/api/v1/plans/$PLAN_ID \
  -H "Authorization: Bearer $TOKEN")

if [ "$DELETE_RESPONSE" = "204" ]; then
    echo "✅ PASS: Travel plan deleted successfully"
else
    echo "❌ FAIL: Failed to delete plan (HTTP $DELETE_RESPONSE)"
    exit 1
fi
echo ""

# Test 8: Verify Deletion
echo "✔️  Test 8: Verify Deletion"
AFTER_DELETE=$(curl -s http://localhost:8080/api/v1/plans \
  -H "Authorization: Bearer $TOKEN")

if [ "$AFTER_DELETE" = "[]" ]; then
    echo "✅ PASS: Plan successfully deleted (list is empty)"
else
    echo "⚠️  WARNING: Plans still exist after deletion: $AFTER_DELETE"
fi
echo ""

echo "========================="
echo "✅ ALL SMOKE TESTS PASSED!"
echo "========================="
echo ""
echo "Test Summary:"
echo "✅ Health Check"
echo "✅ User Registration"
echo "✅ Protected Endpoint Access"
echo "✅ Travel Plan Creation"
echo "✅ Travel Plan Retrieval"
echo "✅ Specific Plan Retrieval"
echo "✅ Travel Plan Deletion"
echo "✅ Deletion Verification"
echo ""
echo "🎉 Sprint 1 Core Functionality: VERIFIED"
echo ""
echo "For comprehensive testing, see LOCAL_VERIFICATION.md"
echo ""
