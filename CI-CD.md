# InvestCopilot CI/CD Pipeline Documentation

Complete guide for the CI/CD pipeline setup, GitHub Actions workflows, and deployment process.

## 📊 Pipeline Architecture

```
┌─────────────┐
│ Push to Git │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│ GitHub Actions   │
│ Workflow Trigger │
└────────┬─────────┘
         │
         ├─── Phase 1: Lint & Type Check ─────┐
         │                                      │
         ├─── Phase 2: Unit & E2E Tests ───────┤
         │                                      │
         ├─── Phase 3: Security Scan ──────────┤
         │                                      ▼
         └─── Phase 4: Build & Push Images
                       │
                       ├─ main branch ──────────────────┐
                       │                                  │
                       └─ develop branch ───┐             │
                                            ▼             ▼
                                      Deploy to      Deploy to
                                      Staging       Production
                                      Oracle        Oracle
                                      Instance      Instance
                                            │             │
                                            ▼             ▼
                                      Health Checks  Health Checks
                                            │             │
                                            ▼             ▼
                                      ✓ Success    ✓ Success
                                    Slack Notify  Slack Notify
```

## 🔄 GitHub Actions Workflow

Location: `.github/workflows/deploy.yml`

### Workflow Triggers

```yaml
on:
  push:
    branches: [main, develop]    # Automatic deployment
  pull_request:
    branches: [main, develop]    # Tests only, no deploy
  workflow_dispatch:             # Manual trigger via GitHub UI
    inputs:
      environment:
        options: [staging, production]
```

### Workflow Jobs

#### 1. Lint & Type Check
- **Runs on:** Every PR and push
- **Checks:**
  - ESLint (code style)
  - TypeScript compilation
- **Artifacts:** None
- **Fails if:** TypeScript errors

#### 2. Tests
- **Runs on:** Every PR and push
- **Services:** PostgreSQL + Redis
- **Tests:**
  - Unit tests (Jest)
  - E2E tests (Playwright)
  - Coverage upload to Codecov
- **Fails if:** Tests fail (E2E optional)

#### 3. Security Scan
- **Runs on:** Every PR and push
- **Tools:**
  - npm audit
  - SNYK (optional)
- **Non-blocking:** Continues even if warnings

#### 4. Build & Push Images
- **Runs on:** Only on push to main/develop
- **Actions:**
  - Build API Docker image
  - Build Frontend Docker image
  - Push to Docker Hub
  - Tag with branch/semver/latest
- **Artifacts:** Docker images in registry

#### 5. Deploy to Staging
- **Triggers:** Push to `develop` branch
- **Steps:**
  1. Connect via SSH to Oracle instance
  2. Pull latest Docker images
  3. Update docker-compose.prod.yml
  4. Run `docker-compose up -d`
  5. Run database migrations
  6. Health check API and Frontend
- **Environment:** Oracle instance (141.148.139.27)
- **Failure Action:** Rollback

#### 6. Deploy to Production
- **Triggers:** Push to `main` branch OR workflow_dispatch
- **Steps:**
  1. Create database backup
  2. Connect via SSH to Oracle instance
  3. Pull latest Docker images
  4. Stop existing containers (graceful)
  5. Start new containers
  6. Run database migrations
  7. Health check (strict)
  8. Slack notification
- **Environment:** Oracle instance (141.148.139.27)
- **Failure Action:** Rollback from backup

## 📋 GitHub Secrets Configuration

Required secrets to add to your GitHub repository:

```
ORACLE_IP              # 141.148.139.27
DEPLOY_SSH_KEY         # Private SSH key (begin with -----BEGIN RSA PRIVATE KEY-----)
DOCKER_USERNAME        # Docker Hub username
DOCKER_PASSWORD        # Docker Hub token (not password)
SLACK_WEBHOOK          # (Optional) Slack webhook URL
SNYK_TOKEN            # (Optional) Snyk security token
```

### Setting Up Secrets

1. Go to GitHub: **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add each secret from list above

### SSH Key Setup

```bash
# On your local machine
ssh-keygen -t rsa -b 4096 -f ~/.ssh/deploy_key -N ""

# Copy public key to Oracle instance
ssh-copy-id -i ~/.ssh/deploy_key.pub ubuntu@141.148.139.27

# Get private key content for GitHub
cat ~/.ssh/deploy_key

# Copy entire content (-----BEGIN RSA PRIVATE KEY----- to -----END RSA PRIVATE KEY-----)
# Paste as DEPLOY_SSH_KEY in GitHub Secrets
```

## 🚀 Deployment Process

### Automatic Deployment (Recommended)

```bash
# For staging (automatic when push to develop)
git checkout develop
git add .
git commit -m "feat: new feature"
git push origin develop
# → GitHub Actions automatically deploys to staging

# For production (automatic when push to main)
git checkout main
git merge develop
git push origin main
# → GitHub Actions automatically deploys to production
```

### Manual Deployment via Workflow Dispatch

1. Go to GitHub: **Actions** → **CI/CD Pipeline**
2. Click **Run workflow**
3. Select branch: `main` or `develop`
4. Select environment: `staging` or `production`
5. Click **Run workflow**
6. Monitor logs

### Local Deployment Script

```bash
# Make executable
chmod +x scripts/deploy.sh

# Set environment
export ORACLE_IP=141.148.139.27

# Run deployment
./scripts/deploy.sh production latest

# Expected output: "Deployment completed successfully!"
```

## 📊 Monitoring & Logs

### GitHub Actions Logs

```bash
# View in GitHub UI
1. Go to repository → Actions
2. Click latest workflow run
3. Click job name
4. View step logs in real-time
```

### Remote Container Logs

```bash
# SSH to Oracle instance
ssh ubuntu@141.148.139.27

# View API logs
docker logs -f investia-api

# View last 50 lines
docker logs --tail 50 investia-api

# View with timestamps
docker logs --timestamps investia-api

# Search for errors
docker logs investia-api | grep ERROR
```

### Health Status

```bash
# Check all containers
docker ps

# Check container stats
docker stats

# Run health check script
./scripts/health-check.sh 30 5
```

## 🔧 Environment-Specific Configs

### Staging Environment

- **Branch:** `develop`
- **Trigger:** Every push to develop
- **Database:** Oracle instance
- **Frontend URL:** http://141.148.139.27:80
- **API URL:** http://141.148.139.27:3001
- **Features:** All enabled (testing new features)
- **Logs:** Verbose (debug level)

### Production Environment

- **Branch:** `main`
- **Trigger:** Push to main or workflow_dispatch
- **Database:** Oracle instance (with backup before deploy)
- **Frontend URL:** http://141.148.139.27:80
- **API URL:** http://141.148.139.27:3001
- **Features:** All enabled (stable)
- **Logs:** Warnings only (warn level)
- **Health Checks:** Strict (must pass 100%)

## 🔄 CI/CD Workflow Examples

### Example 1: Regular Feature Development

```bash
# 1. Create feature branch
git checkout -b feature/new-dashboard

# 2. Develop and commit
git add .
git commit -m "feat: add new dashboard components"

# 3. Push to GitHub (triggers tests)
git push origin feature/new-dashboard

# 4. Create Pull Request
# GitHub: Tests run, must pass before merge

# 5. Merge to develop (after review)
git checkout develop
git merge --squash feature/new-dashboard
git push origin develop

# 6. GitHub automatically deploys to staging
# → Tests run
# → Build Docker images
# → Deploy to staging
# → Health checks
# → Slack notification

# 7. Test in staging at http://141.148.139.27

# 8. When ready, merge to main
git checkout main
git merge develop
git push origin main

# 9. GitHub automatically deploys to production
# → Database backup
# → Tests run
# → Build Docker images
# → Deploy to production
# → Health checks (strict)
# → Slack notification (production deployment)
```

### Example 2: Hotfix for Production

```bash
# 1. Create hotfix branch from main
git checkout -b hotfix/critical-bug main

# 2. Fix the bug
git add .
git commit -m "fix: critical bug in payments"

# 3. Push and create PR to main
git push origin hotfix/critical-bug
# Create PR on GitHub

# 4. Once merged to main
# GitHub automatically deploys to production

# 5. Also merge back to develop
git checkout develop
git merge main
git push origin develop
```

### Example 3: Manual Production Deployment

```bash
# If you need to deploy immediately without push

# 1. Go to GitHub UI
# 2. Actions → CI/CD Pipeline → Run workflow
# 3. Select branch: main
# 4. Select environment: production
# 5. Click "Run workflow"
# 6. Monitor in Actions tab
```

## 🛠️ Troubleshooting

### Deployment Fails: Tests Timeout

**Problem:** E2E tests taking too long, causing timeout

**Solution:**
```yaml
# In .github/workflows/deploy.yml
timeout-minutes: 30  # Increase from default 360
```

### Deployment Fails: SSH Connection Error

**Problem:** "SSH connection refused"

**Solution:**
```bash
# Verify SSH key is correctly added
ssh -i ~/.ssh/deploy_key ubuntu@141.148.139.27 "echo 'SSH works'"

# Re-add to GitHub Secrets if needed
cat ~/.ssh/deploy_key | pbcopy  # macOS
cat ~/.ssh/deploy_key | xclip -selection clipboard  # Linux
```

### Deployment Fails: Docker Build OOM

**Problem:** "Cannot allocate memory"

**Solution:**
```bash
# On Oracle instance, increase memory limit
sudo sysctl vm.swappiness=10

# Or add swap
sudo fallocate -l 2G /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Deployment Fails: Health Check

**Problem:** API returns 503 after deploy

**Solution:**
```bash
# SSH to instance
ssh ubuntu@141.148.139.27

# Check logs
docker logs investia-api | tail -50

# Check database
docker exec investia-db psql -U sardinha investia_db -c "SELECT 1"

# Restart if needed
docker restart investia-api
docker restart investia-db
```

### Rollback Failed Deployment

```bash
# If production deployment fails

# 1. GitHub Actions will attempt rollback automatically
# 2. If that fails, manual rollback:

ssh ubuntu@141.148.139.27 << 'EOF'
  cd /home/ubuntu/investia

  # Stop failed deployment
  docker-compose -f docker-compose.prod.yml down

  # Restore database from backup
  LATEST_BACKUP=$(ls -t backups/investia_db_*.sql | head -1)
  docker exec -i investia-db psql -U sardinha investia_db < $LATEST_BACKUP

  # Start with previous version
  docker-compose -f docker-compose.prod.yml up -d

  # Verify health
  sleep 10
  curl http://localhost:3001/api/health
EOF
```

## 📈 Metrics & Performance

### Build Times

- Lint & Type Check: ~2 minutes
- Tests: ~5-10 minutes
- Docker Build: ~3-5 minutes
- Deployment: ~2 minutes
- **Total:** ~15-30 minutes

### Failure Rates

Target: < 5% failure rate

If higher, check:
- [ ] Flaky tests (timeouts)
- [ ] Resource constraints (memory)
- [ ] External API issues (rate limits)

## 🔐 Security Best Practices

### 1. Secrets Management

```bash
# Never commit secrets
echo ".env.production" >> .gitignore

# Use GitHub Secrets for all sensitive data
# Rotate SSH keys quarterly
# Rotate API keys every 6 months
```

### 2. Code Review

```bash
# Require PR reviews before merge
# Settings → Branches → main
# ✓ Require pull request reviews
# ✓ Dismiss stale pull request approvals
```

### 3. Protected Branches

```bash
# Protect main and develop branches
# Settings → Branches → Protected branches
# ✓ Require status checks to pass before merging
# ✓ Require branches to be up to date before merging
# ✓ Require code reviews before merging
```

### 4. Audit Logs

```bash
# Review who deployed what and when
# Settings → Audit log
# Look for suspicious activity
```

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Build Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Security Scanning Tools](https://snyk.io/)
- [CloudWatch Monitoring](https://aws.amazon.com/cloudwatch/)

---

**Last Updated:** 2026-02-04
**Version:** 1.0
**Maintainer:** InvestCopilot Team
