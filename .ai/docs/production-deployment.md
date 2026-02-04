# Guia de Deploy em Produção - InvestIA

Este documento descreve as configurações e procedimentos necessários para deploy seguro da aplicação InvestIA em ambiente de produção.

## Pré-requisitos

- Docker e Docker Compose instalados
- Servidor com no mínimo 2GB RAM e 2 CPUs
- Domínio configurado com certificado SSL/TLS
- Backup automatizado configurado

---

## Variáveis de Ambiente Obrigatórias

Criar arquivo `.env.production` com as seguintes variáveis:

```bash
# Ambiente
NODE_ENV=production

# Banco de Dados
DATABASE_URL=postgresql://USER:PASSWORD@db:5432/investia_db?schema=public
POSTGRES_USER=investia_user
POSTGRES_PASSWORD=<SENHA_FORTE_AQUI>
POSTGRES_DB=investia_db

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=<SENHA_REDIS_FORTE_AQUI>

# JWT (CRÍTICO: Gerar secrets únicos e fortes)
JWT_SECRET=<SECRET_FORTE_MINIMO_32_CARACTERES>
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# CORS (Apenas domínios de produção)
CORS_ORIGINS=https://seudominio.com,https://www.seudominio.com

# APIs Externas
BRAPI_TOKEN=<SEU_TOKEN_BRAPI>
GEMINI_API_KEY=<SUA_API_KEY_GEMINI>
GEMINI_MODEL=gemini-1.5-flash
OPENAI_API_KEY=<SUA_API_KEY_OPENAI>
OPENAI_MODEL=gpt-4o-mini

# Frontend
NEXT_PUBLIC_API_URL=https://api.seudominio.com
```

### Gerando Secrets Seguros

```bash
# JWT_SECRET (32+ caracteres)
openssl rand -base64 32

# REDIS_PASSWORD
openssl rand -base64 24

# POSTGRES_PASSWORD
openssl rand -base64 24
```

---

## Configurações de Segurança Implementadas

### ✅ SEC-001: JWT Secret Obrigatório
- Aplicação **não inicia** sem `JWT_SECRET` configurado
- Usar secret forte (mínimo 32 caracteres)

### ✅ SEC-002: Validação de Upload
- Magic bytes validation para PDFs
- Limite de 10MB por arquivo

### ✅ SEC-004: Path Traversal Protection
- Validação de paths antes de operações de arquivo
- Sanitização com `path.normalize()` e `path.resolve()`

### ✅ SEC-006: Logging Seguro
- Uso de Logger do NestJS
- Sem exposição de dados sensíveis em logs

### ✅ SEC-009: Rate Limiting
- Refresh token: 3 req/min
- Login: 5 req/min
- Register: 3 req/min

### ✅ SEC-010/011: Access Control
- Verificação de ownership em Assets e Users
- Autenticação obrigatória para endpoints sensíveis

### ✅ SEC-012: HTTP Security Headers
- Helmet configurado com CSP
- X-Frame-Options, X-Content-Type-Options

### ✅ SEC-013/014/015: Docker Hardening
- PostgreSQL e Redis **não expostos** no host
- Redis com autenticação obrigatória
- Debug port removido

---

## Deploy com Docker Compose

### 1. Preparar Ambiente

```bash
# Clonar repositório
git clone <repo-url>
cd InvestIA

# Copiar arquivo de ambiente
cp .env.example .env.production

# Editar variáveis de produção
nano .env.production
```

### 2. Build e Deploy

```bash
# Usar docker-compose.prod.yml
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

# Verificar status
docker-compose -f docker-compose.prod.yml ps

# Verificar logs
docker-compose -f docker-compose.prod.yml logs -f app
```

### 3. Executar Migrações

```bash
docker exec investia-api npx prisma migrate deploy
```

### 4. Verificar Health Checks

```bash
# Backend
curl -f http://localhost:3001/health

# Frontend
curl -f http://localhost:3000

# Verificar health status dos containers
docker ps --format "table {{.Names}}\t{{.Status}}"
```

---

## Configuração de Reverse Proxy (Nginx)

Exemplo de configuração Nginx com SSL:

```nginx
server {
    listen 443 ssl http2;
    server_name api.seudominio.com;

    ssl_certificate /etc/letsencrypt/live/seudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seudominio.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 443 ssl http2;
    server_name seudominio.com www.seudominio.com;

    ssl_certificate /etc/letsencrypt/live/seudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seudominio.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Monitoramento e Logs

### Logs Centralizados

```bash
# Ver logs em tempo real
docker-compose -f docker-compose.prod.yml logs -f

# Logs de um serviço específico
docker-compose -f docker-compose.prod.yml logs -f app

# Últimas 100 linhas
docker-compose -f docker-compose.prod.yml logs --tail=100 app
```

### Métricas de Recursos

```bash
# Uso de recursos dos containers
docker stats

# Verificar limites configurados
docker inspect investia-api | grep -A 10 Resources
```

---

## Backup e Recuperação

### Backup do Banco de Dados

```bash
# Backup manual
docker exec investia-db pg_dump -U investia_user investia_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup automatizado (crontab)
0 2 * * * docker exec investia-db pg_dump -U investia_user investia_db | gzip > /backups/investia_$(date +\%Y\%m\%d).sql.gz
```

### Restauração

```bash
# Restaurar backup
docker exec -i investia-db psql -U investia_user investia_db < backup.sql
```

---

## Checklist de Deploy

### Antes do Deploy

- [ ] Variáveis de ambiente configuradas
- [ ] Secrets gerados (JWT, Redis, PostgreSQL)
- [ ] CORS_ORIGINS configurado com domínios de produção
- [ ] Certificado SSL/TLS configurado
- [ ] Backup automatizado configurado
- [ ] Monitoramento configurado

### Durante o Deploy

- [ ] Build das imagens Docker
- [ ] Executar migrações do banco
- [ ] Verificar health checks
- [ ] Testar endpoints principais
- [ ] Verificar logs por erros

### Após o Deploy

- [ ] Testar autenticação (login/register)
- [ ] Testar upload de arquivos
- [ ] Verificar rate limiting
- [ ] Testar CORS
- [ ] Verificar headers de segurança
- [ ] Monitorar uso de recursos
- [ ] Configurar alertas

---

## Troubleshooting

### Container não inicia

```bash
# Ver logs detalhados
docker-compose -f docker-compose.prod.yml logs app

# Verificar variáveis de ambiente
docker exec investia-api env | grep JWT_SECRET
```

### Erro de conexão com banco

```bash
# Verificar se PostgreSQL está rodando
docker-compose -f docker-compose.prod.yml ps db

# Testar conexão
docker exec investia-api npx prisma db pull
```

### Health check falhando

```bash
# Verificar endpoint de health
curl -v http://localhost:3001/health

# Ver logs do container
docker logs investia-api --tail=50
```

---

## Atualizações e Manutenção

### Atualizar Aplicação

```bash
# Pull das últimas mudanças
git pull origin main

# Rebuild e restart
docker-compose -f docker-compose.prod.yml up -d --build

# Executar migrações se necessário
docker exec investia-api npx prisma migrate deploy
```

### Rotação de Secrets

1. Gerar novos secrets
2. Atualizar `.env.production`
3. Restart dos containers
4. Invalidar sessões antigas (se aplicável)

---

## Contato e Suporte

Para questões de segurança, entre em contato com a equipe de DevOps.

**Última atualização:** 02/02/2026
