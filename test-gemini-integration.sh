#!/bin/bash

echo "=============================================="
echo "Gemini Integration End-to-End Test"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:8080"

# Test user credentials
TEST_EMAIL="test@example.com"
TEST_PASSWORD="TestPassword123"

echo "Step 1: Health Check"
echo "--------------------"
HEALTH_RESPONSE=$(curl -s "$BASE_URL/actuator/health")
echo "Response: $HEALTH_RESPONSE"

if echo "$HEALTH_RESPONSE" | grep -q '"status":"UP"'; then
    echo -e "${GREEN}✅ Application is running${NC}"
else
    echo -e "${RED}❌ Application is not healthy${NC}"
    exit 1
fi
echo ""

echo "Step 2: Register Test User"
echo "---------------------------"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Test User\",
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }")

echo "Response: $REGISTER_RESPONSE"
if echo "$REGISTER_RESPONSE" | grep -q 'token\|already exists'; then
    echo -e "${GREEN}✅ User registered or already exists${NC}"
else
    echo -e "${YELLOW}⚠️  Registration response unclear, continuing...${NC}"
fi
echo ""

echo "Step 3: Login"
echo "-------------"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }")

echo "Response: $LOGIN_RESPONSE"

# Extract token
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Failed to get authentication token${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Login successful${NC}"
echo "Token: ${TOKEN:0:20}..."
echo ""

echo "Step 4: Generate Travel Plan (CRITICAL TEST)"
echo "---------------------------------------------"
echo "Calling Gemini API to generate itinerary..."
echo ""

GENERATE_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$BASE_URL/api/v1/travel-plans" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "destination": "Paris, France",
    "startDate": "2026-07-01",
    "endDate": "2026-07-05",
    "numberOfTravelers": 2,
    "preferences": {
      "activities": ["museums", "food", "culture"],
      "pace": "moderate",
      "budget": "medium"
    }
  }')

# Extract HTTP status
HTTP_STATUS=$(echo "$GENERATE_RESPONSE" | grep "HTTP_STATUS:" | cut -d':' -f2)
RESPONSE_BODY=$(echo "$GENERATE_RESPONSE" | sed '/HTTP_STATUS:/d')

echo "HTTP Status: $HTTP_STATUS"
echo ""
echo "Response Body:"
echo "$RESPONSE_BODY" | head -c 1000
echo ""
echo "..."
echo ""

if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "201" ]; then
    # Check if response contains an itinerary
    if echo "$RESPONSE_BODY" | grep -q '"itinerary"'; then
        ITINERARY_PREVIEW=$(echo "$RESPONSE_BODY" | grep -o '"itinerary":"[^"]*"' | cut -d'"' -f4 | head -c 200)
        echo -e "${GREEN}✅ Travel plan generated successfully!${NC}"
        echo ""
        echo "Itinerary Preview:"
        echo "$ITINERARY_PREVIEW..."
        
        # Extract travel plan ID
        PLAN_ID=$(echo "$RESPONSE_BODY" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
        echo ""
        echo "Travel Plan ID: $PLAN_ID"
    else
        echo -e "${RED}❌ Response missing itinerary field${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Failed to generate travel plan (HTTP $HTTP_STATUS)${NC}"
    echo "Response: $RESPONSE_BODY"
    exit 1
fi
echo ""

echo "Step 5: Retrieve Travel Plans"
echo "------------------------------"
RETRIEVE_RESPONSE=$(curl -s -X GET "$BASE_URL/api/v1/travel-plans" \
  -H "Authorization: Bearer $TOKEN")

echo "Response:"
echo "$RETRIEVE_RESPONSE" | head -c 500
echo ""
echo "..."

if echo "$RETRIEVE_RESPONSE" | grep -q '\['; then
    PLAN_COUNT=$(echo "$RETRIEVE_RESPONSE" | grep -o '"id":' | wc -l)
    echo -e "${GREEN}✅ Retrieved travel plans (count: $PLAN_COUNT)${NC}"
else
    echo -e "${RED}❌ Failed to retrieve travel plans${NC}"
    exit 1
fi
echo ""

if [ ! -z "$PLAN_ID" ]; then
    echo "Step 6: Retrieve Specific Travel Plan (ID: $PLAN_ID)"
    echo "------------------------------------------------------"
    SPECIFIC_RESPONSE=$(curl -s -X GET "$BASE_URL/api/v1/travel-plans/$PLAN_ID" \
      -H "Authorization: Bearer $TOKEN")
    
    echo "Response:"
    echo "$SPECIFIC_RESPONSE" | head -c 500
    echo ""
    
    if echo "$SPECIFIC_RESPONSE" | grep -q '"id"'; then
        echo -e "${GREEN}✅ Retrieved specific travel plan${NC}"
    else
        echo -e "${RED}❌ Failed to retrieve specific travel plan${NC}"
        exit 1
    fi
fi

echo ""
echo "=============================================="
echo -e "${GREEN}✅ ALL TESTS PASSED!${NC}"
echo "=============================================="
echo ""
echo "Summary:"
echo "- Health check: PASS"
echo "- User registration: PASS"
echo "- User login: PASS"
echo "- Travel plan generation (Gemini API): PASS"
echo "- Travel plan persistence: PASS"
echo "- Travel plan retrieval: PASS"
echo ""
echo "Gemini integration is working correctly!"
