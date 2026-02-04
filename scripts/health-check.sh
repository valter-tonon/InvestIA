#!/bin/bash

##########################################################################
# HEALTH CHECK SCRIPT FOR INVESTIA
# Monitors API, Frontend, Database, and Redis health
#
# Usage: ./health-check.sh [interval] [max_failures]
# Example: ./health-check.sh 60 5  (check every 60s, alert after 5 failures)
##########################################################################

set -u

# Configuration
CHECK_INTERVAL=${1:-30}  # seconds between checks
MAX_FAILURES=${2:-5}
VERBOSE=${VERBOSE:-false}

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# State tracking
API_FAILURES=0
FRONTEND_FAILURES=0
DB_FAILURES=0
REDIS_FAILURES=0

log_info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} ℹ $1"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} ✓ $1"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} ⚠ $1"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} ✗ $1"
}

check_api() {
    local url="http://localhost:3001/api/health"
    local response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)

    if [ "$response" == "200" ]; then
        log_success "API is healthy (HTTP $response)"
        API_FAILURES=0
        return 0
    else
        ((API_FAILURES++))
        log_error "API health check failed (HTTP $response) - Failures: $API_FAILURES"
        return 1
    fi
}

check_frontend() {
    local url="http://localhost:80"
    local response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)

    if [ "$response" == "200" ] || [ "$response" == "404" ]; then
        log_success "Frontend is responsive (HTTP $response)"
        FRONTEND_FAILURES=0
        return 0
    else
        ((FRONTEND_FAILURES++))
        log_error "Frontend check failed (HTTP $response) - Failures: $FRONTEND_FAILURES"
        return 1
    fi
}

check_database() {
    local result=$(docker exec investia-db pg_isready -U sardinha -d investia_db 2>/dev/null)

    if echo "$result" | grep -q "accepting connections"; then
        log_success "Database is healthy"
        DB_FAILURES=0
        return 0
    else
        ((DB_FAILURES++))
        log_error "Database check failed - Failures: $DB_FAILURES"
        return 1
    fi
}

check_redis() {
    local result=$(docker exec investia-redis redis-cli ping 2>/dev/null)

    if [ "$result" == "PONG" ]; then
        log_success "Redis is healthy"
        REDIS_FAILURES=0
        return 0
    else
        ((REDIS_FAILURES++))
        log_error "Redis check failed - Failures: $REDIS_FAILURES"
        return 1
    fi
}

check_docker_containers() {
    log_info "Checking Docker containers..."

    local containers=("investia-api" "investia-db" "investia-redis" "investia-frontend")
    local all_running=true

    for container in "${containers[@]}"; do
        local status=$(docker inspect -f '{{.State.Running}}' "$container" 2>/dev/null)
        if [ "$status" == "true" ]; then
            log_success "Container $container is running"
        else
            log_error "Container $container is not running"
            all_running=false
        fi
    done

    return $([ "$all_running" = true ] && echo 0 || echo 1)
}

check_disk_space() {
    local threshold=90  # percent
    local usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')

    if [ "$usage" -lt "$threshold" ]; then
        log_success "Disk usage: ${usage}% (OK)"
        return 0
    else
        log_warning "Disk usage: ${usage}% (HIGH)"
        return 1
    fi
}

check_memory() {
    local threshold=85  # percent
    local usage=$(free | awk 'NR==2 {print int($3/$2 * 100)}')

    if [ "$usage" -lt "$threshold" ]; then
        log_success "Memory usage: ${usage}% (OK)"
        return 0
    else
        log_warning "Memory usage: ${usage}% (HIGH)"
        return 1
    fi
}

send_alert() {
    local service=$1
    local message=$2

    log_error "ALERT: $service - $message"

    # TODO: Implement alert mechanisms
    # Options:
    # - Email notification
    # - Slack webhook
    # - PagerDuty
    # - CloudWatch
    # Example:
    # curl -X POST https://hooks.slack.com/services/YOUR/WEBHOOK/URL \
    #     -d "payload={\"text\": \"$message\"}"
}

check_and_report() {
    echo ""
    log_info "Running health checks..."

    check_docker_containers || true
    check_api || true
    check_frontend || true
    check_database || true
    check_redis || true
    check_disk_space || true
    check_memory || true

    # Check thresholds and alert
    if [ $API_FAILURES -ge $MAX_FAILURES ]; then
        send_alert "API" "Failed $API_FAILURES consecutive checks"
    fi

    if [ $FRONTEND_FAILURES -ge $MAX_FAILURES ]; then
        send_alert "Frontend" "Failed $FRONTEND_FAILURES consecutive checks"
    fi

    if [ $DB_FAILURES -ge $MAX_FAILURES ]; then
        send_alert "Database" "Failed $DB_FAILURES consecutive checks"
    fi

    if [ $REDIS_FAILURES -ge $MAX_FAILURES ]; then
        send_alert "Redis" "Failed $REDIS_FAILURES consecutive checks"
    fi

    # Summary
    echo ""
    log_info "Check complete. Next check in ${CHECK_INTERVAL}s..."
}

# Main loop
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}InvestIA Health Check Monitor${NC}"
echo -e "${BLUE}Check interval: ${CHECK_INTERVAL}s | Max failures: ${MAX_FAILURES}${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"

check_and_report

# Single check mode (if run without loop)
if [ "${VERBOSE}" == "true" ]; then
    # Continuous monitoring
    while true; do
        sleep "$CHECK_INTERVAL"
        check_and_report
    done
fi
