#!/bin/bash

# Comprehensive stress test script
BASE_URL="http://localhost:3000"
REQUESTS_PER_ENDPOINT=10
CONCURRENT_REQUESTS=5

echo "=============================================="
echo "🔥 STRESS TEST - ALL ENDPOINTS"
echo "=============================================="
echo "Base URL: $BASE_URL"
echo "Requests per endpoint: $REQUESTS_PER_ENDPOINT"
echo "Concurrent requests: $CONCURRENT_REQUESTS"
echo ""

# Array of endpoints to test
ENDPOINTS=(
  "/api/health"
  "/api/projects"
  "/api/documents"
  "/api/tenders"
  "/api/resources/team-members"
  "/api/resources/allocations"
  "/api/admin/validation/report"
  "/api/admin/logs"
)

# Test function
test_endpoint() {
  local endpoint=$1
  local count=$2
  local errors=0
  local total_time=0

  for ((i=1; i<=count; i++)); do
    local response=$(curl -w "\n%{http_code}\n%{time_total}" -s "$BASE_URL$endpoint" 2>&1)
    local http_code=$(echo "$response" | tail -2 | head -1)
    local time=$(echo "$response" | tail -1)

    if [[ ! "$http_code" =~ ^[245] ]]; then
      ((errors++))
    fi

    total_time=$(echo "$total_time + $time" | bc)
  done

  local avg_time=$(echo "scale=3; $total_time / $count" | bc)
  local success=$((count - errors))

  echo "  $endpoint: $success/$count success | Avg: ${avg_time}s"
}

# Run tests
echo "📊 Testing endpoints..."
for endpoint in "${ENDPOINTS[@]}"; do
  test_endpoint "$endpoint" $REQUESTS_PER_ENDPOINT &

  # Limit concurrent requests
  if (( $(jobs -r -p | wc -l) >= CONCURRENT_REQUESTS )); then
    wait -n
  fi
done

wait

echo ""
echo "=============================================="
echo "✓ Stress test complete"
echo "=============================================="
