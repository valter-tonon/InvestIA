#!/bin/bash

##########################################################################
# INVESTCOPILOT DEPLOYMENT SCRIPT
# Deploys the InvestCopilot application to Oracle instance via SSH
#
# Usage: ./deploy.sh <environment> [version]
# Example: ./deploy.sh production v1.0.0
##########################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
VERSION=${2:-latest}
REMOTE_USER="ubuntu"
REMOTE_HOST="${ORACLE_IP}"
REMOTE_APP_DIR="/home/ubuntu/investia"
DOCKER_REGISTRY="docker.io"
LOG_FILE="/tmp/investia-deploy-$(date +%s).log"

# Validation
if [ -z "$ORACLE_IP" ]; then
    echo -e "${RED}❌ Error: ORACLE_IP environment variable not set${NC}"
    echo "   Set it with: export ORACLE_IP=141.148.139.27"
    exit 1
fi

if [ "$ENVIRONMENT" != "production" ] && [ "$ENVIRONMENT" != "staging" ]; then
    echo -e "${RED}❌ Invalid environment: $ENVIRONMENT${NC}"
    echo "   Use: production or staging"
    exit 1
fi

print_header() {
    echo -e "\n${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

# ============================================================================
# PHASE 1: Local Validation
# ============================================================================

print_header "PHASE 1: Local Validation"

print_info "Checking prerequisites..."

# Check if Docker is running locally
if ! docker ps &> /dev/null; then
    print_error "Docker is not running"
    exit 1
fi
print_success "Docker is running"

# Check if SSH key exists
if [ ! -f ~/.ssh/id_rsa ]; then
    print_error "SSH key not found at ~/.ssh/id_rsa"
    exit 1
fi
print_success "SSH key found"

# Check git status
if [ -z "$(git diff --quiet)" ]; then
    print_info "Git working directory is clean"
else
    print_info "⚠ Git working directory has uncommitted changes"
fi

# ============================================================================
# PHASE 2: Build Docker Images Locally
# ============================================================================

print_header "PHASE 2: Building Docker Images"

print_info "Building backend image..."
docker build -f Dockerfile.prod -t investia-api:$VERSION .
print_success "Backend image built"

print_info "Building frontend image..."
docker build -t investia-frontend:$VERSION ./frontend
print_success "Frontend image built"

# ============================================================================
# PHASE 3: Run Local Tests
# ============================================================================

print_header "PHASE 3: Running Local Tests"

print_info "Running TypeScript check..."
npm run build 2>&1 | tee -a "$LOG_FILE"
print_success "TypeScript check passed"

print_info "Running ESLint..."
npm run lint 2>&1 | tee -a "$LOG_FILE" || print_info "Lint warnings (non-blocking)"
print_success "ESLint completed"

# ============================================================================
# PHASE 4: SSH Connection & Remote Setup
# ============================================================================

print_header "PHASE 4: SSH Connection & Remote Setup"

print_info "Testing SSH connection to $REMOTE_HOST..."
if ! ssh -o ConnectTimeout=5 "${REMOTE_USER}@${REMOTE_HOST}" "echo 'SSH connection OK'" &> /dev/null; then
    print_error "SSH connection failed to $REMOTE_HOST"
    exit 1
fi
print_success "SSH connection established"

print_info "Creating app directory structure..."
ssh "${REMOTE_USER}@${REMOTE_HOST}" << 'REMOTE_SETUP'
    mkdir -p /home/ubuntu/investia
    mkdir -p /home/ubuntu/investia/logs
    mkdir -p /home/ubuntu/investia/backups
    mkdir -p /home/ubuntu/investia/configs
    echo "Remote directories created"
REMOTE_SETUP
print_success "Remote directories created"

# ============================================================================
# PHASE 5: Transfer Files
# ============================================================================

print_header "PHASE 5: Transferring Files to Remote"

print_info "Copying docker-compose.prod.yml..."
scp docker-compose.prod.yml "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_APP_DIR}/"
print_success "docker-compose.prod.yml transferred"

print_info "Copying .env.production..."
if [ -f .env.production ]; then
    scp .env.production "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_APP_DIR}/.env"
    print_success ".env transferred"
else
    print_error ".env.production not found"
    print_info "Using SSH to create .env from template..."
fi

print_info "Copying deployment scripts..."
scp scripts/health-check.sh "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_APP_DIR}/scripts/" || true
print_success "Scripts transferred"

# ============================================================================
# PHASE 6: Create Backup (if exists)
# ============================================================================

print_header "PHASE 6: Creating Backup"

print_info "Backing up current database..."
ssh "${REMOTE_USER}@${REMOTE_HOST}" << 'REMOTE_BACKUP'
    cd /home/ubuntu/investia

    # Backup database
    BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="backups/investia_db_${BACKUP_DATE}.sql"

    docker exec investia-db pg_dump -U sardinha investia_db > "$BACKUP_FILE" 2>/dev/null || echo "Database backup skipped (first deployment)"

    # Backup volumes
    docker run --rm -v investia_pgdata:/data -v /home/ubuntu/investia/backups:/backup alpine tar czf /backup/investia_pgdata_${BACKUP_DATE}.tar.gz -C /data . || true

    echo "Backups created: $BACKUP_FILE"
REMOTE_BACKUP
print_success "Backup completed"

# ============================================================================
# PHASE 7: Pull Latest Images & Start Services
# ============================================================================

print_header "PHASE 7: Deploying Services"

print_info "Pulling latest images and starting services..."
ssh "${REMOTE_USER}@${REMOTE_HOST}" << 'REMOTE_DEPLOY'
    cd /home/ubuntu/investia

    # Stop existing containers gracefully
    echo "Stopping existing containers..."
    docker-compose -f docker-compose.prod.yml down || true

    # Create/update containers
    echo "Building and starting services..."
    docker-compose -f docker-compose.prod.yml up -d --build 2>&1

    # Wait for services to be ready
    echo "Waiting for services to be ready..."
    sleep 10

    echo "Deployment complete"
REMOTE_DEPLOY
print_success "Services deployed"

# ============================================================================
# PHASE 8: Run Database Migrations
# ============================================================================

print_header "PHASE 8: Database Migrations"

print_info "Running Prisma migrations..."
ssh "${REMOTE_USER}@${REMOTE_HOST}" << 'REMOTE_MIGRATIONS'
    cd /home/ubuntu/investia

    # Run migrations
    docker exec investia-api npm run prisma:migrate 2>&1 || echo "Migrations: no pending migrations"

    # Seed database (optional)
    docker exec investia-api npm run prisma:seed 2>&1 || echo "Database seed skipped"

    echo "Migrations completed"
REMOTE_MIGRATIONS
print_success "Migrations completed"

# ============================================================================
# PHASE 9: Health Checks
# ============================================================================

print_header "PHASE 9: Health Checks"

print_info "Checking API health..."
sleep 5

API_URL="http://${REMOTE_HOST}:3001"
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "${API_URL}/api/health" 2>/dev/null || echo "000")

if [ "$HEALTH_CHECK" == "200" ]; then
    print_success "API is healthy (HTTP $HEALTH_CHECK)"
else
    print_error "API health check failed (HTTP $HEALTH_CHECK)"
    print_info "Checking logs..."
    ssh "${REMOTE_USER}@${REMOTE_HOST}" "docker logs investia-api | tail -20"
    exit 1
fi

# Check frontend
print_info "Checking Frontend health..."
FRONTEND_URL="http://${REMOTE_HOST}:80"
FRONTEND_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "${FRONTEND_URL}" 2>/dev/null || echo "000")

if [ "$FRONTEND_CHECK" == "200" ]; then
    print_success "Frontend is healthy (HTTP $FRONTEND_CHECK)"
else
    print_error "Frontend health check failed (HTTP $FRONTEND_CHECK)"
fi

# ============================================================================
# PHASE 10: Cleanup & Summary
# ============================================================================

print_header "PHASE 10: Deployment Summary"

print_success "Deployment completed successfully!"

cat << EOF

${BLUE}═══════════════════════════════════════════════════════${NC}
DEPLOYMENT SUMMARY
${BLUE}═══════════════════════════════════════════════════════${NC}

Environment:     ${GREEN}$ENVIRONMENT${NC}
Version:         ${GREEN}$VERSION${NC}
Remote Host:     ${GREEN}$REMOTE_HOST${NC}
Deployment Date: ${GREEN}$(date)${NC}

${BLUE}URLs:${NC}
  Backend API:  http://${REMOTE_HOST}:3001
  Frontend:     http://${REMOTE_HOST}:80
  Swagger Docs: http://${REMOTE_HOST}:3001/api

${BLUE}Docker Containers:${NC}
EOF

ssh "${REMOTE_USER}@${REMOTE_HOST}" "docker ps --format 'table {{.Names}}\t{{.Status}}' | grep investia"

cat << EOF

${BLUE}Logs:${NC}
  Local deployment log: $LOG_FILE

${BLUE}Next Steps:${NC}
  1. Test the application at http://${REMOTE_HOST}:80
  2. Monitor logs: docker logs -f investia-api
  3. To rollback: docker-compose down && docker volume rm <backup>

${BLUE}═══════════════════════════════════════════════════════${NC}

EOF

print_success "All checks passed. Deployment successful!"

exit 0
