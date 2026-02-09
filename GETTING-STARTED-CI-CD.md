# 🚀 Getting Started - InvestCopilot CI/CD

**Your CI/CD pipeline is ready.** This 5-minute guide will get you deployed.

## 🎯 You Have Two Options

### Option A: Deploy NOW (Recommended for First Deploy)
*Takes ~30 minutes, everything automated*

```bash
# 1. Make scripts executable
chmod +x scripts/*.sh

# 2. Deploy in one command
./scripts/quick-deploy.sh 141.148.139.27 your-docker-username your-docker-token

# Done! Wait for health checks to pass.
# Then access: http://141.148.139.27
```

**What happens:**
- ✓ Oracle instance automatically configured
- ✓ Docker installed
- ✓ Containers started
- ✓ Database migrations run
- ✓ Health checks verify success

### Option B: Setup GitHub Secrets FIRST (For Automated Deployments)
*Takes ~5 minutes setup, then deploy automatically*

#### Step 1: Generate SSH Key

```bash
# On your local machine
ssh-keygen -t rsa -b 4096 -f ~/.ssh/deploy_key -N ""

# Add to Oracle instance
ssh-copy-id -i ~/.ssh/deploy_key.pub ubuntu@141.148.139.27

# Get the private key for GitHub
cat ~/.ssh/deploy_key
# Copy entire output (-----BEGIN RSA PRIVATE KEY----- to -----END RSA PRIVATE KEY-----)
```

#### Step 2: Add GitHub Secrets

1. Go to GitHub: **Settings → Secrets and variables → Actions**
2. Click **New repository secret**
3. Add these secrets:

| Secret Name | Value |
|---|---|
| `ORACLE_IP` | `141.148.139.27` |
| `DEPLOY_SSH_KEY` | *(Paste your private key from above)* |
| `DOCKER_USERNAME` | *(Your Docker Hub username)* |
| `DOCKER_PASSWORD` | *(Your Docker Hub token, NOT password)* |

#### Step 3: Test Automatic Deployment

```bash
# Make a small change
echo "# Updated" >> README.md

# Commit and push to develop
git add .
git commit -m "test: ci-cd pipeline"
git push origin develop

# Watch GitHub Actions automatically deploy to staging
# Go to: GitHub → Actions → See your workflow run

# Once passed, merge to main for production deployment
git checkout main
git merge develop
git push origin main

# Watch automatic production deployment with all safety checks
```

## ✅ Verify Deployment Success

After deployment, check these:

```bash
# 1. API is responding
curl http://141.148.139.27:3001/api/health
# Expected: HTTP 200 with status OK

# 2. Frontend is accessible
curl http://141.148.139.27
# Expected: HTTP 200 with HTML

# 3. View logs
ssh ubuntu@141.148.139.27 'docker logs -f investia-api'

# 4. Run health check
ssh ubuntu@141.148.139.27 'cd /home/ubuntu/investia && ./scripts/health-check.sh'
```

## 📊 Understanding Your Pipeline

```
You push code to GitHub
           ↓
GitHub Actions runs automatically
           ├─ Tests your code
           ├─ Builds Docker images
           └─ Deploys to Oracle instance
                       ↓
                Health checks
                       ↓
              ✅ Success → Live at http://141.148.139.27
              ❌ Failed → Auto-rollback, alert you
```

## 🔄 Your Development Workflow Now

```
1. Work on feature branch
   git checkout -b feature/my-feature

2. Commit and push
   git push origin feature/my-feature

3. Create PR on GitHub
   (Tests run automatically)

4. Get review & merge to develop
   (Auto-deploys to http://141.148.139.27 → test it)

5. When ready, merge to main
   (Auto-deploys to production with backup)

6. Done! No manual deployment needed.
```

## 📚 Full Documentation

- **Quick Guide:** `README-CI-CD.md` (this has everything)
- **Detailed Deploy:** `DEPLOYMENT.md` (450 lines, all scenarios)
- **Pipeline Docs:** `CI-CD.md` (technical architecture)

## 🆘 Troubleshooting

### Problem: Deployment fails at health check
```bash
ssh ubuntu@141.148.139.27
docker logs investia-api | tail -50
# Check what went wrong, fix it, and retry
```

### Problem: Can't connect to Oracle instance
```bash
# Check SSH key
ssh -i ~/.ssh/deploy_key ubuntu@141.148.139.27 'echo "Connected"'

# If fails, re-add SSH key to GitHub Secrets
cat ~/.ssh/deploy_key | pbcopy  # macOS
# Or: xclip -selection clipboard < ~/.ssh/deploy_key  # Linux
```

### Problem: Docker login fails
```bash
# Use Docker token, not password
# Get token from: Docker Hub → Account Settings → Security → New Access Token

# Test manually
ssh ubuntu@141.148.139.27
docker login -u your-username -p your-token
```

## 📈 What's Automated

✅ **Testing**
- ESLint code style checks
- TypeScript compilation
- Unit tests
- E2E tests
- Coverage reporting

✅ **Building**
- Docker image creation
- Image optimization
- Push to registry

✅ **Deploying**
- SSH to Oracle instance
- Pull latest images
- Stop old containers
- Start new containers
- Run migrations
- Health checks

✅ **Monitoring**
- Daily database backups (2 AM)
- Health checks every 5 minutes
- Container status monitoring
- Disk/memory alerts

## 🎯 Quick Reference

| Task | Command |
|------|---------|
| Deploy now | `./scripts/quick-deploy.sh 141.148.139.27 user token` |
| Check status | `ssh ubuntu@141.148.139.27 'docker ps'` |
| View logs | `ssh ubuntu@141.148.139.27 'docker logs investia-api'` |
| Health check | `./scripts/health-check.sh` |
| Manual deploy | `export ORACLE_IP=141.148.139.27 && ./scripts/deploy.sh` |
| Rollback | See `DEPLOYMENT.md` → Rollback Strategy |

## 🚀 You're Ready!

Choose one:
- **Fast Track:** Run Option A above (one command)
- **Automated Track:** Do Option B above (5-minute setup)

Both result in the same Your InvestCopilot application now has:t http://141.148.139.27
✅ API at http://141.148.139.27:3001
✅ Swagger docs at http://141.148.139.27:3001/api

---

**Questions?** See `README-CI-CD.md` or `DEPLOYMENT.md`

**Ready?** Run: `./scripts/quick-deploy.sh 141.148.139.27 docker_user docker_token`
