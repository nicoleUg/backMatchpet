#!/bin/bash
# Diagnostico de endpoints MatchPet

echo "=== MATCHPET API DIAGNOSTICS ==="
echo

HOST=${1:-"http://localhost:3000"}

echo "Testing: $HOST"
echo

# Test 1: Health
echo "1. Testing GET /health"
curl -s -w "\nStatus: %{http_code}\n\n" "$HOST/health" 2>&1 | head -20
echo

# Test 2: Sessions
echo "2. Testing GET /sessions"
curl -s -w "\nStatus: %{http_code}\n\n" "$HOST/sessions" 2>&1 | head -20
echo

# Test 3: Register with test data
echo "3. Testing POST /register"
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser_'$(date +%s)'","email":"test_'$(date +%s)'@test.com","password":"Pass123456"}' \
  -w "\nStatus: %{http_code}\n\n" \
  "$HOST/register" 2>&1 | head -40
echo

# Test 4: Login with test data
echo "4. Testing POST /login"
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"juan_carlos","password":"Password123"}' \
  -w "\nStatus: %{http_code}\n\n" \
  "$HOST/login" 2>&1 | head -40
echo

echo "=== END DIAGNOSTICS ==="
