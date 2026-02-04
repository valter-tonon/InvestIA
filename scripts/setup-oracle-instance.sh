#!/bin/bash

##########################################################################
# ORACLE INSTANCE SETUP SCRIPT
# Run this once on a fresh Ubuntu 22.04 instance
#
# Usage: ./setup-oracle-instance.sh
# Or via curl: curl -fsSL https://your-repo/scripts/setup-oracle-instance.sh | bash
##########################################################################

set -e

# Colors
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

# ============================================================================
# CHECK IF RUNNING AS ROOT
# ============================================================================

if [ "$EUID" -eq 0 ]; then
   print_error "Do not run this script as root"
   echo "Run as: ubuntu user"
   exit 1
fi

# ============================================================================
# PHASE 1: Update System
# ============================================================================

print_header "PHASE 1: Updating System"

print_info "Running apt update and upgrade..."
sudo apt update
sudo apt upgrade -y
print_success "System updated"

# ============================================================================
# PHASE 2: Install Docker
# ============================================================================

print_header "PHASE 2: Installing Docker"

# Check if Docker is already installed
if command -v docker &> /dev/null; then
    print_info "Docker already installed: $(docker --version)"
else
    print_info "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    rm get-docker.sh
    print_success "Docker installed"
fi

# Add user to docker group
sudo usermod -aG docker $(whoami) || true
print_success "User added to docker group"

# ============================================================================
# PHASE 3: Install Docker Compose
# ============================================================================

print_header "PHASE 3: Installing Docker Compose"

if command -v docker-compose &> /dev/null; then
    print_info "Docker Compose already installed: $(docker-compose --version)"
else
    print_info "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    print_success "Docker Compose installed"
fi

# ============================================================================
# PHASE 4: Create Application Directory
# ============================================================================

print_header "PHASE 4: Creating Application Directories"

mkdir -p /home/ubuntu/investia/{logs,backups,configs,scripts}
mkdir -p /home/ubuntu/investia/backups/{database,volumes}

print_success "Directories created"

# ============================================================================
# PHASE 5: Setup Firewall
# ============================================================================

print_header "PHASE 5: Configuring Firewall"

# Check if UFW is installed
if ! command -v ufw &> /dev/null; then
    print_info "Installing UFW..."
    sudo apt install -y ufw
fi

print_info "Configuring firewall rules..."
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS (future)
sudo ufw allow 3001/tcp  # API (optional, restrict if needed)
sudo ufw --force enable

print_success "Firewall configured"

# ============================================================================
# PHASE 6: Setup Swap (for low-memory instances)
# ============================================================================

print_header "PHASE 6: Setting up Swap"

# Check current swap
SWAP_SIZE=$(free -h | grep Swap | awk '{print $2}')
print_info "Current swap: $SWAP_SIZE"

if [ "$SWAP_SIZE" == "0B" ]; then
    print_info "Creating 2GB swap file..."
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    print_success "Swap created"
else
    print_info "Swap already configured"
fi

# ============================================================================
# PHASE 7: Install Monitoring Tools (Optional)
# ============================================================================

print_header "PHASE 7: Installing Monitoring Tools"

print_info "Installing htop, iotop, and other tools..."
sudo apt install -y \
    htop \
    iotop \
    net-tools \
    curl \
    wget \
    git \
    nano \
    jq

print_success "Monitoring tools installed"

# ============================================================================
# PHASE 8: Setup Log Rotation
# ============================================================================

print_header "PHASE 8: Setting up Log Rotation"

sudo tee /etc/logrotate.d/investia > /dev/null << 'EOF'
/home/ubuntu/investia/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    notifempty
    create 0640 ubuntu ubuntu
    sharedscripts
    postrotate
        docker restart investia-api > /dev/null 2>&1 || true
    endscript
}
EOF

print_success "Log rotation configured"

# ============================================================================
# PHASE 9: Create Cron Jobs
# ============================================================================

print_header "PHASE 9: Setting up Cron Jobs"

# Backup job (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * cd /home/ubuntu/investia && docker exec investia-db pg_dump -U sardinha investia_db > backups/database/investia_db_\$(date +\%Y\%m\%d_\%H\%M\%S).sql") | crontab - || true

# Health check job (every 5 minutes)
(crontab -l 2>/dev/null; echo "*/5 * * * * cd /home/ubuntu/investia && ./scripts/health-check.sh 30 5 >> logs/health-check.log 2>&1") | crontab - || true

print_success "Cron jobs configured"

# ============================================================================
# PHASE 10: Create systemd service for cleanup
# ============================================================================

print_header "PHASE 10: Setting up Maintenance Service"

sudo tee /etc/systemd/system/docker-cleanup.service > /dev/null << 'EOF'
[Unit]
Description=Docker Cleanup
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
ExecStart=/usr/bin/docker system prune -f --volumes

[Install]
WantedBy=multi-user.target
EOF

sudo tee /etc/systemd/system/docker-cleanup.timer > /dev/null << 'EOF'
[Unit]
Description=Run Docker Cleanup daily

[Timer]
OnCalendar=daily
OnBootSec=1h
Persistent=true

[Install]
WantedBy=timers.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable docker-cleanup.timer
sudo systemctl start docker-cleanup.timer

print_success "Maintenance service configured"

# ============================================================================
# PHASE 11: Create .env Template
# ============================================================================

print_header "PHASE 11: Creating Configuration Template"

cat > /home/ubuntu/investia/.env.template << 'EOF'
NODE_ENV=production
DATABASE_URL=postgresql://sardinha:sardinha123@db:5432/investia_db?schema=public
REDIS_HOST=redis
REDIS_PORT=6379
GEMINI_API_KEY=
OPENAI_API_KEY=
NEXT_PUBLIC_API_URL=http://$(hostname -I | awk '{print $1}'):3001
EOF

print_success ".env template created"

# ============================================================================
# PHASE 12: Display Summary
# ============================================================================

print_header "SETUP COMPLETE"

cat << EOF

${BLUE}═══════════════════════════════════════════════════════${NC}
ORACLE INSTANCE SETUP SUMMARY
${BLUE}═══════════════════════════════════════════════════════${NC}

${GREEN}Installed:${NC}
  ✓ Docker: $(docker --version)
  ✓ Docker Compose: $(docker-compose --version)
  ✓ UFW Firewall (SSH, HTTP, API allowed)
  ✓ Monitoring tools (htop, iotop, etc.)

${GREEN}Configured:${NC}
  ✓ Application directory: /home/ubuntu/investia
  ✓ Swap: $(free -h | grep Swap | awk '{print $2}')
  ✓ Log rotation
  ✓ Backup cron (daily 2 AM)
  ✓ Health check cron (every 5 min)
  ✓ Docker cleanup timer (daily)

${BLUE}Next Steps:${NC}

1. Copy docker-compose.prod.yml to /home/ubuntu/investia/
   scp docker-compose.prod.yml ubuntu@${HOSTNAME}:/home/ubuntu/investia/

2. Create .env file
   cp .env.template .env
   nano .env  # Edit with your values

3. Start services
   docker-compose -f docker-compose.prod.yml up -d

4. Check health
   ./scripts/health-check.sh

5. View logs
   docker logs -f investia-api

${BLUE}Firewall Rules:${NC}
EOF

sudo ufw status | grep -E "^[0-9]|^To"

cat << EOF

${BLUE}System Information:${NC}
  Hostname: $(hostname)
  IP Address: $(hostname -I)
  Disk: $(df -h / | tail -1 | awk '{print $2}')
  RAM: $(free -h | grep "^Mem" | awk '{print $2}')
  CPU: $(nproc) cores

${BLUE}═══════════════════════════════════════════════════════${NC}

${GREEN}✓ Instance is ready for deployment!${NC}

EOF

# ============================================================================
# FINAL STEP: Prompt for reboot
# ============================================================================

print_info "You may need to reload your shell to apply docker group changes"
print_info "Run: newgrp docker"

read -p "Reboot now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Rebooting..."
    sudo reboot
else
    print_info "Please run 'newgrp docker' to apply docker group changes"
fi
