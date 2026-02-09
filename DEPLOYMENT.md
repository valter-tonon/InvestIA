# InvestCopilot Deployment Guide

Complete guide for deploying InvestCopilot to production on Oracle instance.

## 📋 Prerequisites

- Oracle instance running Ubuntu 22.04+ with public IP `141.148.139.27`
- SSH access configured: `ubuntu@141.148.139.27`
- Docker & Docker Compose installed on remote instance
- GitHub repository with Actions enabled
- Docker Hub account for image registry

## 🔧 Setup Oracle Instance

### 1. Initial SSH Setup

```bash
# Connect to instance
ssh ubuntu@141.148.139.27

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker ubuntu
newgrp docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### 2. Create Application Directory

```bash
mkdir -p /home/ubuntu/investia/{logs,backups,configs}
cd /home/ubuntu/investia
```

### 3. Setup Firewall (if needed)

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP (Frontend)
sudo ufw allow 3001/tcp  # API
sudo ufw enable
```

## 🚀 Local Development Setup

### 1. Generate SSH Keys (if not already set)

```bash
# Generate SSH key for GitHub Actions
ssh-keygen -t rsa -b 4096 -f ~/.ssh/deploy_key -N ""

# Add public key to Ubuntu instance
cat ~/.ssh/deploy_key.pub | ssh ubuntu@141.148.139.27 'mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys'
```

### 2. Configure GitHub Secrets

In your GitHub repository, add the following secrets:

```
ORACLE_IP                 = 141.148.139.27
DEPLOY_SSH_KEY           = (content of ~/.ssh/deploy_key)
DOCKER_USERNAME          = (your Docker Hub username)
DOCKER_PASSWORD          = (your Docker Hub token/password)
SLACK_WEBHOOK            = (optional - for Slack notifications)
SNYK_TOKEN               = (optional - for security scanning)
```

### 3. Setup Environment Files

```bash
# Create production environment file
cp .env.production.example .env.production

# Edit with your production values
nano .env.production

# Transfer to remote (or set via CI/CD)
scp .env.production ubuntu@141.148.139.27:/home/ubuntu/investia/.env
```

## 📦 Building Docker Images

### Local Build

```bash
# Build backend
docker build -t investia-api:latest .

# Build frontend
docker build -t investia-frontend:latest ./frontend

# Test locally
docker-compose -f docker-compose.prod.yml up -d
```

### Push to Registry

```bash
# Login to Docker Hub
docker login -u your-username

# Tag images
docker tag investia-api:latest your-username/investia-api:latest
docker tag investia-frontend:latest your-username/investia-frontend:latest

# Push
docker push your-username/investia-api:latest
docker push your-username/investia-frontend:latest
```

## 🌐 Deployment Methods

### Method 1: Automated (GitHub Actions) - Recommended

1. **Push to main branch triggers production deployment**
   ```bash
   git push origin main
   ```

2. **Workflow automatically:**
   - ✅ Runs tests
   - ✅ Builds Docker images
   - ✅ Pushes to registry
   - ✅ Deploys to Oracle instance
   - ✅ Runs health checks
   - ✅ Sends Slack notifications

### Method 2: Manual Deployment via SSH

```bash
# Make script executable
chmod +x scripts/deploy.sh

# Set environment variable
export ORACLE_IP=141.148.139.27

# Run deployment
./scripts/deploy.sh production latest
```

**Output:**
```
═══════════════════════════════════════════════════════
PHASE 1: Local Validation
✓ Docker is running
✓ SSH key found

PHASE 2: Building Docker Images
ℹ Building backend image...
✓ Backend image built

PHASE 3: Running Local Tests
✓ TypeScript check passed
✓ ESLint completed

PHASE 4: SSH Connection & Remote Setup
✓ SSH connection established
✓ Remote directories created

PHASE 5: Transferring Files to Remote
✓ docker-compose.prod.yml transferred

PHASE 6: Creating Backup
✓ Backup completed

PHASE 7: Deploying Services
✓ Services deployed

PHASE 8: Database Migrations
✓ Migrations completed

PHASE 9: Health Checks
✓ API is healthy (HTTP 200)
✓ Frontend is healthy (HTTP 200)

═══════════════════════════════════════════════════════
✓ All checks passed. Deployment successful!
```

## 🏥 Health Monitoring

### Manual Health Check

```bash
# SSH to instance
ssh ubuntu@141.148.139.27

# Run health check script
cd /home/ubuntu/investia
./scripts/health-check.sh 30 5  # Check every 30s, alert after 5 failures
```

### Health Endpoints

```bash
# API Health
curl http://141.148.139.27:3001/api/health

# Frontend
curl http://141.148.139.27:80

# API Swagger Docs
curl http://141.148.139.27:3001/api

# Database Status
ssh ubuntu@141.148.139.27 'docker exec investia-db pg_isready -U sardinha'

# Redis Status
ssh ubuntu@141.148.139.27 'docker exec investia-redis redis-cli ping'
```

## 📊 Monitoring & Logs

```bash
# View container logs
ssh ubuntu@141.148.139.27 'docker logs -f investia-api'
ssh ubuntu@141.148.139.27 'docker logs -f investia-frontend'
ssh ubuntu@141.148.139.27 'docker logs -f investia-db'
ssh ubuntu@141.148.139.27 'docker logs -f investia-redis'

# View all containers
ssh ubuntu@141.148.139.27 'docker ps'

# Check container resource usage
ssh ubuntu@141.148.139.27 'docker stats'
```

## 💾 Backup & Restore

### Create Manual Backup

```bash
ssh ubuntu@141.148.139.27 << 'EOF'
  cd /home/ubuntu/investia
  BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
  docker exec investia-db pg_dump -U sardinha investia_db > backups/investia_db_${BACKUP_DATE}.sql
  echo "Backup created: backups/investia_db_${BACKUP_DATE}.sql"
EOF
```

### Restore from Backup

```bash
ssh ubuntu@141.148.139.27 << 'EOF'
  cd /home/ubuntu/investia
  # List available backups
  ls -lah backups/

  # Restore specific backup
  BACKUP_FILE=backups/investia_db_20260204_120000.sql
  docker exec -i investia-db psql -U sardinha investia_db < $BACKUP_FILE
  echo "Restore completed"
EOF
```

## 🔄 Rollback Strategy

### Quick Rollback (if deployment fails)

```bash
# SSH to instance
ssh ubuntu@141.148.139.27

cd /home/ubuntu/investia

# Stop current containers
docker-compose -f docker-compose.prod.yml down

# Restore from backup
BACKUP_FILE=$(ls -t backups/investia_db_*.sql | head -1)
docker exec -i investia-db psql -U sardinha investia_db < $BACKUP_FILE

# Start with previous version
docker-compose -f docker-compose.prod.yml up -d
```

## 🔐 Security Best Practices

### 1. Environment Variables

```bash
# Never commit .env.production to git
echo ".env.production" >> .gitignore

# Transfer via secure SSH only
scp .env.production ubuntu@141.148.139.27:/home/ubuntu/investia/.env
```

### 2. Database Credentials

```bash
# Change default credentials in production
# Update docker-compose.prod.yml with strong passwords
# Store in GitHub Secrets
```

### 3. SSH Key Management

```bash
# Restrict key permissions
chmod 600 ~/.ssh/deploy_key
chmod 700 ~/.ssh

# Use SSH agent
eval $(ssh-agent)
ssh-add ~/.ssh/deploy_key
```

### 4. Firewall Rules

```bash
# Only allow necessary ports
sudo ufw allow from any to any port 22    # SSH
sudo ufw allow from any to any port 80    # HTTP
sudo ufw allow from any to any port 443   # HTTPS (future)
sudo ufw allow from any to any port 3001  # API (restrict if needed)

# Deny everything else
sudo ufw default deny incoming
sudo ufw default allow outgoing
```

## 📈 Performance Tuning

### Database Optimization

```bash
# Connect to DB
docker exec -it investia-db psql -U sardinha investia_db

# Check table sizes
\dt+

# Create indexes if needed
CREATE INDEX idx_assets_ticker ON assets(ticker);
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
```

### Memory Management

```bash
# Check current limits in docker-compose.prod.yml
# Current: NODE_OPTIONS="--max-old-space-size=400"

# For 1GB RAM instance: 400MB
# For 2GB RAM instance: 800MB
# For 4GB RAM instance: 1600MB

# Update accordingly:
sed -i 's/400/800/g' docker-compose.prod.yml
```

## 🚨 Troubleshooting

### API not responding

```bash
# Check container status
docker ps | grep investia-api

# Check logs for errors
docker logs investia-api | tail -50

# Restart container
docker restart investia-api

# Check database connection
docker exec investia-api npm run prisma:introspect
```

### Database connection issues

```bash
# Test database
docker exec investia-db pg_isready -U sardinha

# Check database logs
docker logs investia-db | tail -20

# Connect directly
docker exec -it investia-db psql -U sardinha investia_db
```

### Frontend not loading

```bash
# Check frontend logs
docker logs investia-frontend | tail -50

# Test if service is listening
curl -v http://localhost:80

# Restart container
docker restart investia-frontend
```

### Disk space issues

```bash
# Check disk usage
df -h

# Clean up Docker images
docker image prune -a

# Clean up containers
docker container prune

# Clean up volumes
docker volume prune
```

## 📝 Maintenance Tasks

### Daily

- [ ] Monitor logs for errors
- [ ] Verify health endpoints responding
- [ ] Check disk space usage

### Weekly

- [ ] Review application logs for issues
- [ ] Backup database manually
- [ ] Check for pending updates

### Monthly

- [ ] Security updates for OS and packages
- [ ] Performance review and optimization
- [ ] Disaster recovery drill (test restore)

## 🆘 Support & Monitoring

### Enable Monitoring (Optional)

```bash
# Setup Sentry for error tracking
# Update .env with SENTRY_DSN

# Setup Slack notifications
# Update GitHub Secrets with SLACK_WEBHOOK

# Setup CloudWatch metrics
# Configure AWS credentials for monitoring
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Prisma Migration Guide](https://www.prisma.io/docs/orm/prisma-migrate/getting-started)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

**Last Updated:** 2026-02-04
**Version:** 1.0
