# 🚀 InvestCopilot CI/CD - Quick Start Guide

Complete CI/CD pipeline for automated testing, building, and deployment to Oracle instance.

## 📋 What Was Created

### 1. **GitHub Actions Workflow**
📄 `.github/workflows/deploy.yml` (300+ lines)
- Lint & Type checking
- Unit & E2E tests with PostgreSQL + Redis
- Security scanning
- Docker image building and pushing
- Automatic deployment to staging (develop branch)
- Automatic deployment to production (main branch)
- Health checks and rollback on failure
- Slack notifications

### 2. **Deployment Scripts**
- 📄 `scripts/deploy.sh` - Full deployment with validation
- 📄 `scripts/health-check.sh` - Monitoring and health verification
- 📄 `scripts/setup-oracle-instance.sh` - Initial Oracle instance setup
- 📄 `scripts/quick-deploy.sh` - One-command complete setup

### 3. **Configuration Files**
- 📄 `.env.production.example` - Production environment template
- 📄 `docker-compose.prod.yml` - Already existed, ready to use

### 4. **Documentation**
- 📄 `DEPLOYMENT.md` - Complete deployment guide (400+ lines)
- 📄 `CI-CD.md` - CI/CD pipeline documentation (350+ lines)
- 📄 `README-CI-CD.md` - This file

## ⚡ Quick Start (5 Minutes)

### Option A: One-Command Deploy

```bash
# Make scripts executable
chmod +x scripts/*.sh

# Deploy to Oracle instance in one command
# (assumes SSH key is set up)
./scripts/quick-deploy.sh 141.148.139.27 docker_username docker_token
```

**What it does:**
1. ✓ SSH into Oracle instance
2. ✓ Install Docker & Docker Compose
3. ✓ Setup firewall, directories, cron jobs
4. ✓ Copy docker-compose.prod.yml
5. ✓ Create .env file
6. ✓ Deploy containers
7. ✓ Run database migrations
8. ✓ Health checks

### Option B: Step-by-Step

```bash
# 1. Setup Oracle instance (one time only)
ssh ubuntu@141.148.139.27
./setup-oracle-instance.sh
exit

# 2. Deploy application
export ORACLE_IP=141.148.139.27
./scripts/deploy.sh production latest
```

### Option C: Automatic via GitHub Actions

1. Set GitHub Secrets (see below)
2. Push to branches:
   ```bash
   # Automatic staging deployment
   git push origin develop

   # Automatic production deployment
   git push origin main
   ```

## 🔑 GitHub Secrets Setup

Add these secrets to your GitHub repository:

```
ORACLE_IP         = 141.148.139.27
DEPLOY_SSH_KEY    = (your private SSH key)
DOCKER_USERNAME   = (Docker Hub username)
DOCKER_PASSWORD   = (Docker Hub token)
SLACK_WEBHOOK     = (optional - for notifications)
```

### Generate SSH Key

```bash
# Create deployment key
ssh-keygen -t rsa -b 4096 -f ~/.ssh/deploy_key -N ""

# Copy to Oracle instance
ssh-copy-id -i ~/.ssh/deploy_key.pub ubuntu@141.148.139.27

# Get private key for GitHub Secret
cat ~/.ssh/deploy_key
# Copy entire content to GitHub: Settings → Secrets → DEPLOY_SSH_KEY
```

## 📊 Pipeline Overview

```
Event: Push to Git
        ↓
GitHub Actions Triggered
        ├→ Lint & Type Check (2 min)
        ├→ Unit & E2E Tests (5-10 min)
        ├→ Security Scan (2 min)
        └→ Build & Push Images (3-5 min)
                ↓
         Image in Registry
                ↓
    Push to main?    Push to develop?
        ↓                    ↓
   Production         Staging
   Deployment         Deployment
        ↓                    ↓
   Database Backup   Deploy to Oracle
   Deploy to Oracle   Migrations
   Migrations         Health Checks
   Health Checks
   Slack Notify
```

## 📌 Deployment Strategies

### Staging (develop branch)
- **Trigger:** Every push to develop
- **Environment:** Oracle instance
- **Testing:** Full test suite required
- **Duration:** ~20 minutes
- **Rollback:** Automatic if health check fails

### Production (main branch)
- **Trigger:** Push to main (or manual)
- **Environment:** Oracle instance
- **Backup:** Database backup before deploy
- **Health Checks:** Strict (all endpoints must respond)
- **Notifications:** Slack alert on success/failure
- **Rollback:** Automatic if health check fails

## 📁 File Structure

```
InvestIA/
├── .github/workflows/
│   └── deploy.yml                    # GitHub Actions workflow
├── scripts/
│   ├── deploy.sh                     # Full deployment script
│   ├── health-check.sh               # Health monitoring
│   ├── setup-oracle-instance.sh      # Initial setup
│   └── quick-deploy.sh               # One-command deploy
├── DEPLOYMENT.md                     # Deployment guide
├── CI-CD.md                          # CI/CD documentation
├── README-CI-CD.md                   # This file
├── docker-compose.prod.yml           # Production Docker setup
└── .env.production.example           # Env template
```

## 🔍 Monitoring & Logs

### GitHub Actions Logs
```bash
# View in GitHub UI
Repository → Actions → Workflow Runs → Click Run
```

### Remote Application Logs
```bash
ssh ubuntu@141.148.139.27

# API logs
docker logs -f investia-api

# Frontend logs
docker logs -f investia-frontend

# Database logs
docker logs -f investia-db

# Redis logs
docker logs -f investia-redis
```

### Health Status
```bash
# Check via curl
curl http://141.148.139.27:3001/api/health
curl http://141.148.139.27

# Run health check script
ssh ubuntu@141.148.139.27 'cd /home/ubuntu/investia && ./scripts/health-check.sh'
```

## 🛠️ Common Tasks

### Deploy to Staging Immediately
```bash
git checkout develop
git commit -m "test deployment"
git push origin develop
# → GitHub Actions auto-deploys to staging
```

### Deploy to Production with Manual Trigger
```bash
# Via GitHub UI:
# Actions → CI/CD Pipeline → Run workflow → Select environment
# Or via command line:
gh workflow run deploy.yml -f environment=production
```

### Check Deployment Status
```bash
# GitHub Actions
gh run list --workflow=deploy.yml --limit=5

# Remote instance
ssh ubuntu@141.148.139.27 'docker ps'
ssh ubuntu@141.148.139.27 'curl http://localhost:3001/api/health'
```

### View Recent Deployments
```bash
ssh ubuntu@141.148.139.27

# List recent backups
ls -lh /home/ubuntu/investia/backups/database/

# Check deployment logs
tail -100 /home/ubuntu/investia/logs/*.log

# View cron job history
grep CRON /var/log/syslog | tail -20
```

### Manual Rollback
```bash
ssh ubuntu@141.148.139.27 << 'EOF'
  cd /home/ubuntu/investia

  # List available backups
  ls -lh backups/database/

  # Stop current deployment
  docker-compose -f docker-compose.prod.yml down

  # Restore specific backup
  BACKUP="backups/database/investia_db_20260204_120000.sql"
  docker exec -i investia-db psql -U sardinha investia_db < $BACKUP

  # Start containers
  docker-compose -f docker-compose.prod.yml up -d
EOF
```

## 📊 Success Criteria

After deployment, verify:

- [ ] **API is responding**
  ```bash
  curl http://141.148.139.27:3001/api/health
  # Expected: HTTP 200 with {"status":"ok"}
  ```

- [ ] **Frontend is accessible**
  ```bash
  curl http://141.148.139.27
  # Expected: HTTP 200 with HTML content
  ```

- [ ] **Database is healthy**
  ```bash
  ssh ubuntu@141.148.139.27 'docker exec investia-db pg_isready -U sardinha'
  # Expected: "accepting connections"
  ```

- [ ] **Redis is working**
  ```bash
  ssh ubuntu@141.148.139.27 'docker exec investia-redis redis-cli ping'
  # Expected: "PONG"
  ```

- [ ] **No error logs**
  ```bash
  ssh ubuntu@141.148.139.27 'docker logs investia-api | grep ERROR'
  # Expected: No results
  ```

## 🚨 Troubleshooting

### Problem: SSH Connection Fails

```bash
# Check SSH key permissions
ls -la ~/.ssh/deploy_key
# Should be: -rw------- (600)

# Verify Oracle instance has public key
ssh ubuntu@141.148.139.27 'cat ~/.ssh/authorized_keys | grep your-key'

# Test connection
ssh -i ~/.ssh/deploy_key ubuntu@141.148.139.27 'echo "Connected"'
```

### Problem: GitHub Actions Secrets Not Working

```bash
# Verify secrets exist
# GitHub → Settings → Secrets and variables → Actions

# Verify secret value is correct
# (can't view directly, but can test by deployment failure)

# Debug: Add echo to workflow (then remove)
- name: Debug Secrets
  run: echo "ORACLE_IP length: ${#ORACLE_IP}"
  env:
    ORACLE_IP: ${{ secrets.ORACLE_IP }}
```

### Problem: Deployment Fails at Health Check

```bash
# Check application logs
ssh ubuntu@141.148.139.27 'docker logs investia-api | tail -50'

# Check database connection
ssh ubuntu@141.148.139.27 'docker exec investia-api npm run prisma:introspect'

# Check if migrations ran
ssh ubuntu@141.148.139.27 'docker logs investia-api | grep -i "prisma\|migration"'

# Restart services
ssh ubuntu@141.148.139.27 'docker-compose -f /home/ubuntu/investia/docker-compose.prod.yml restart'
```

### Problem: Docker Images Won't Pull

```bash
# Check Docker login
ssh ubuntu@141.148.139.27 'docker login'
# Use Docker token, not password

# Manually pull and test
ssh ubuntu@141.148.139.27 'docker pull your-username/investia-api:latest'

# Update GitHub Secret with correct credentials
```

## 📈 Next Steps

1. **Test the pipeline**
   - [ ] Create a test branch
   - [ ] Make a small change
   - [ ] Push to develop
   - [ ] Monitor GitHub Actions
   - [ ] Verify deployment to staging

2. **Setup monitoring**
   - [ ] Configure Slack webhook
   - [ ] Setup error tracking (Sentry)
   - [ ] Setup uptime monitoring

3. **Optimize performance**
   - [ ] Review build times
   - [ ] Optimize Docker images
   - [ ] Setup caching

4. **Security hardening**
   - [ ] Rotate SSH keys quarterly
   - [ ] Enable branch protection on main
   - [ ] Require code reviews before merge
   - [ ] Setup automated security scanning

5. **Scale infrastructure**
   - [ ] Monitor resource usage
   - [ ] Consider load balancing if needed
   - [ ] Setup CDN for static assets
   - [ ] Database replication for high availability

## 📞 Support

For issues or questions:

1. **Check logs:** `docker logs investia-api`
2. **Check GitHub Actions:** Repository → Actions
3. **Read documentation:** `DEPLOYMENT.md` or `CI-CD.md`
4. **Run health check:** `./scripts/health-check.sh`

## ✅ Implementation Checklist

- [x] GitHub Actions workflow created
- [x] Deployment scripts created
- [x] Health check script created
- [x] Setup script for Oracle instance
- [x] Quick deploy script created
- [x] Environment configuration template
- [x] Complete documentation
- [ ] GitHub Secrets configured (YOU NEED TO DO THIS)
- [ ] First successful deployment (YOU NEED TO DO THIS)
- [ ] Monitoring setup (optional)
- [ ] Team training (optional)

## 🎯 Summary

Your InvestCopilot application now has:

✅ **Automated CI/CD Pipeline** - Tests and builds on every push
✅ **Multiple Deployment Strategies** - Staging and production with safety checks
✅ **Health Monitoring** - Automatic verification of deployment success
✅ **Backup & Rollback** - Database backup before production deploy
✅ **Scalable Setup** - Ready for multiple environments
✅ **Complete Documentation** - Everything you need to operate

---

**Ready to deploy?** Start with:
```bash
chmod +x scripts/quick-deploy.sh
./scripts/quick-deploy.sh 141.148.139.27 docker_username docker_token
```

**Last Updated:** 2026-02-04
**Version:** 1.0
