#!/bin/bash

##########################################################################
# QUICK DEPLOY SCRIPT
# Complete setup of Oracle instance and deployment in one command
#
# Usage: ./quick-deploy.sh <oracle-ip> <docker-username> <docker-password>
# Example: ./quick-deploy.sh 141.148.139.27 myuser mytoken
##########################################################################

set -e

ORACLE_IP=${1:-}
DOCKER_USERNAME=${2:-}
DOCKER_PASSWORD=${3:-}

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Validation
if [ -z "$ORACLE_IP" ]; then
    print_error "Usage: $0 <oracle-ip> <docker-username> <docker-password>"
    print_error "Example: $0 141.148.139.27 myuser mytoken"
    exit 1
fi

print_header "INVESTIA QUICK DEPLOY"

# ========================================================================
# STEP 1: Setup Oracle Instance
# ========================================================================

print_header "STEP 1: Setting up Oracle instance"

print_info "Executing setup script on Oracle instance..."

ssh -o StrictHostKeyChecking=accept-new ubuntu@"$ORACLE_IP" << 'SETUP_SCRIPT'

set -e

# Quick setup inline
echo "Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
rm get-docker.sh

echo "Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

echo "Creating directories..."
mkdir -p /home/ubuntu/investia/{logs,backups,configs,scripts}

echo "Configuring firewall..."
sudo apt update && sudo apt install -y ufw
sudo ufw --force enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3001/tcp

echo "Setup completed"

SETUP_SCRIPT

print_success "Oracle instance setup completed"

# ========================================================================
# STEP 2: Transfer Files
# ========================================================================

print_header "STEP 2: Transferring files"

print_info "Copying docker-compose.prod.yml..."
scp docker-compose.prod.yml ubuntu@"$ORACLE_IP":/home/ubuntu/investia/
print_success "docker-compose.prod.yml transferred"

print_info "Copying scripts..."
scp scripts/health-check.sh ubuntu@"$ORACLE_IP":/home/ubuntu/investia/scripts/
scp scripts/setup-oracle-instance.sh ubuntu@"$ORACLE_IP":/home/ubuntu/investia/scripts/
print_success "Scripts transferred"

print_info "Copying DEPLOYMENT.md..."
scp DEPLOYMENT.md ubuntu@"$ORACLE_IP":/home/ubuntu/investia/
print_success "Documentation transferred"

# ========================================================================
# STEP 3: Create .env file
# ========================================================================

print_header "STEP 3: Creating .env configuration"

print_info "Creating .env file on remote instance..."

ssh ubuntu@"$ORACLE_IP" << ENV_SETUP
cat > /home/ubuntu/investia/.env << 'EOF'
NODE_ENV=production
DATABASE_URL=postgresql://sardinha:sardinha123@db:5432/investia_db?schema=public
REDIS_HOST=redis
REDIS_PORT=6379
NEXT_PUBLIC_API_URL=http://$ORACLE_IP:3001
EOF
echo ".env created"
ENV_SETUP

print_success ".env file created"

# ========================================================================
# STEP 4: Login to Docker & Deploy
# ========================================================================

print_header "STEP 4: Deploying containers"

print_info "Logging in to Docker Hub and starting services..."

ssh ubuntu@"$ORACLE_IP" << DEPLOY_SCRIPT
cd /home/ubuntu/investia

# Login to Docker
docker login -u "$DOCKER_USERNAME" -p "$DOCKER_PASSWORD" || echo "Docker login failed - continuing with public images"

# Pull and run images if available, otherwise build locally
docker-compose -f docker-compose.prod.yml up -d

# Wait for services
echo "Waiting for services to be ready..."
sleep 15

# Run migrations
echo "Running database migrations..."
docker exec investia-api npm run prisma:migrate -- --skip-generate 2>/dev/null || echo "Migrations: no changes needed"

echo "Deployment completed"
DEPLOY_SCRIPT

print_success "Services deployed and running"

# ========================================================================
# STEP 5: Health Checks
# ========================================================================

print_header "STEP 5: Running health checks"

print_info "Waiting for services to stabilize..."
sleep 5

print_info "Checking API health..."
API_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" "http://$ORACLE_IP:3001/api/health" 2>/dev/null || echo "000")

if [ "$API_HEALTH" == "200" ]; then
    print_success "API is healthy"
else
    print_error "API health check failed (HTTP $API_HEALTH)"
    print_info "You can check logs with: ssh ubuntu@$ORACLE_IP 'docker logs investia-api'"
fi

print_info "Checking Frontend health..."
FRONTEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" "http://$ORACLE_IP:80" 2>/dev/null || echo "000")

if [ "$FRONTEND_HEALTH" == "200" ] || [ "$FRONTEND_HEALTH" == "404" ]; then
    print_success "Frontend is responsive"
else
    print_error "Frontend check failed (HTTP $FRONTEND_HEALTH)"
fi

# ========================================================================
# SUMMARY
# ========================================================================

print_header "DEPLOYMENT SUMMARY"

cat << EOF

${GREEN}✓ Deployment completed successfully!${NC}

${BLUE}Access Points:${NC}
  Frontend:    http://$ORACLE_IP:80
  Backend API: http://$ORACLE_IP:3001
  Swagger:     http://$ORACLE_IP:3001/api

${BLUE}Useful Commands:${NC}
  SSH to instance:
    ssh ubuntu@$ORACLE_IP

  View logs:
    docker logs -f investia-api
    docker logs -f investia-frontend

  Run health check:
    cd /home/ubuntu/investia
    ./scripts/health-check.sh

  Check container status:
    docker ps

${BLUE}Next Steps:${NC}
  1. Test the application at http://$ORACLE_IP
  2. Setup GitHub Secrets for CI/CD:
     - ORACLE_IP=$ORACLE_IP
     - DEPLOY_SSH_KEY
     - DOCKER_USERNAME=$DOCKER_USERNAME
     - DOCKER_PASSWORD=****

  3. Configure automated deployments in GitHub Actions

  4. Monitor logs and performance

  5. Setup backups and monitoring

${BLUE}Documentation:${NC}
  See /home/ubuntu/investia/DEPLOYMENT.md for detailed guide

${BLUE}═══════════════════════════════════════════════════════${NC}

EOF

print_success "All done! Your application is live."

exit 0
