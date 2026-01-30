#!/bin/bash

# Quick Health Check - Simple, Reliable Status Report
# Usage: ./scripts/quick-health-check.sh

BASE_URL="${API_BASE_URL:-http://localhost:3000}"

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║          QUICK SYSTEM HEALTH CHECK                         ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Base URL: $BASE_URL"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counter
PASSED=0
FAILED=0

# Test function
test_endpoint() {
  local name=$1
  local url=$2
  local expected_status=$3

  # Make request and capture both status and body
  local response=$(curl -s -w "\n%{http_code}" "$url" 2>&1)
  local body=$(echo "$response" | head -n -1)
  local status=$(echo "$response" | tail -n 1)

  if [ "$status" = "$expected_status" ]; then
    echo -e "${GREEN}✓${NC} $name"
    echo "  Status: $status | Latency: $(curl -s -w "%{time_total}s" -o /dev/null "$url")"
    ((PASSED++))
  else
    echo -e "${RED}✗${NC} $name"
    echo "  Expected: $expected_status | Got: $status"
    ((FAILED++))
  fi
}

# Run tests
echo "━━━ CORE ENDPOINTS ━━━"
test_endpoint "Health Check" "$BASE_URL/api/health" "200"
test_endpoint "Projects (Protected)" "$BASE_URL/api/projects" "401"
test_endpoint "Documents (Protected)" "$BASE_URL/api/documents" "401"
test_endpoint "Tenders (Protected)" "$BASE_URL/api/tenders" "401"

echo ""
echo "━━━ DETAIL ENDPOINTS (Auth Crash Test) ━━━"
test_endpoint "Document Detail" "$BASE_URL/api/documents/test-id" "401"
test_endpoint "Tender Detail" "$BASE_URL/api/tenders/test-id" "401"

echo ""
echo "━━━ RESOURCE ENDPOINTS ━━━"
test_endpoint "Team Members" "$BASE_URL/api/resources/team-members" "401"
test_endpoint "Allocations" "$BASE_URL/api/resources/allocations" "401"

echo ""
echo "━━━ ADMIN ENDPOINTS ━━━"
test_endpoint "Validation Report" "$BASE_URL/api/admin/validation/report" "401"
test_endpoint "System Logs" "$BASE_URL/api/admin/logs" "401"

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║ RESULTS                                                    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "Passed: ${GREEN}$PASSED${NC} | Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ SYSTEM HEALTHY${NC}"
  exit 0
else
  echo -e "${RED}✗ SYSTEM HAS ISSUES${NC}"
  exit 1
fi
