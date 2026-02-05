# Code Audit Report - InvestIA

**Data:** 03/02/2026
**Versao:** 2.0
**Branch:** feature/dashboard-frontend
**Auditor:** Claude Code (Opus 4.5)

---

## Sumario Executivo

Este documento apresenta uma analise completa de qualidade, seguranca e boas praticas do projeto InvestIA. A analise cobriu:

- **Backend:** NestJS + Clean Architecture + Prisma
- **Frontend:** Next.js 16 + TailwindCSS + shadcn/ui
- **Infraestrutura:** Docker Compose + PostgreSQL + Redis
- **Banco de Dados:** PostgreSQL com Prisma ORM

### Score Geral

| Area | Score | Status | Evolucao |
|------|-------|--------|----------|
| Seguranca Backend | 8/10 | BOM | +4 pontos |
| Seguranca Frontend | 8/10 | BOM | +3 pontos |
| Qualidade Backend | 7/10 | BOM | +1.8 pontos |
| Qualidade Frontend | 7/10 | BOM | +1.5 pontos |
| Infraestrutura | 8/10 | BOM | +4 pontos |

**Nota Geral: 7.5/10**

---

## Historico de Auditorias

| Data | Versao | Nota | Principais Mudancas |
|------|--------|------|---------------------|
| 31/01/2026 | 1.0 | 4.5/10 | Auditoria inicial - multiplas vulnerabilidades criticas |
| 03/02/2026 | 2.0 | 7.5/10 | Correcoes de seguranca implementadas, arquitetura melhorada |

---

## 1. Status das Vulnerabilidades de Seguranca

### 1.1 Vulnerabilidades CORRIGIDAS

| ID | Problema | Status | Arquivo | Correcao Implementada |
|----|----------|--------|---------|----------------------|
| SEC-001 | Fallback secret hardcoded em JWT | CORRIGIDO | jwt.strategy.ts:23 | `configService.getOrThrow('JWT_SECRET')` |
| SEC-003 | Credenciais expostas em .env | NAO APLICAVEL | .gitignore:8 | .env nunca foi commitado, esta no .gitignore |
| SEC-004 | Path traversal no delete | CORRIGIDO | delete-philosophy.use-case.ts:32-41 | Validacao com path.resolve() e verificacao de diretorio base |
| SEC-005 | Tokens JWT em localStorage | CORRIGIDO | auth.controller.ts:86-102 | HttpOnly Cookies com SameSite=strict |
| SEC-006 | Console.log expondo dados | CORRIGIDO | jwt.strategy.ts | Logs removidos, usando Logger do NestJS |
| SEC-007 | Ausencia de protecao CSRF | CORRIGIDO | csrf.middleware.ts | Double Submit Cookie pattern implementado |
| SEC-008 | JSON parsing sem try-catch | CORRIGIDO | providers/*.ts | Try-catch adicionado |
| SEC-009 | Falta rate limiting em refresh | CORRIGIDO | auth.controller.ts:50 | `@Throttle({ limit: 3, ttl: 60000 })` |
| SEC-010 | Broken access control em assets | NAO APLICAVEL | assets.controller.ts | Assets sao globais por design (acoes do mercado) |
| SEC-011 | Broken access control em users | CORRIGIDO | users.controller.ts | JwtAuthGuard + verificacao de ownership |
| SEC-012 | Falta headers de seguranca HTTP | CORRIGIDO | main.ts:19-29 | Helmet configurado com CSP |
| SEC-013 | Banco de dados exposto | CORRIGIDO | docker-compose.prod.yml:59-61 | Porta nao exposta em producao |
| SEC-014 | Redis sem autenticacao | CORRIGIDO | docker-compose.prod.yml:83 | `--requirepass` obrigatorio |
| SEC-015 | Debug port exposto | CORRIGIDO | docker-compose.prod.yml:10 | Porta 9229 removida |
| SEC-016 | Limite upload 50MB alto | CORRIGIDO | multer.config.ts:47 | Reduzido para 10MB |
| SEC-017 | Access/Refresh mesmo secret | PARCIAL | token.service.ts:26-34 | Suporte implementado, requer config em producao |
| SEC-018 | Senha minima 6 caracteres | CORRIGIDO | register.input.ts:10 | `@MinLength(8)` |
| SEC-019 | CORS permite localhost em prod | CORRIGIDO | main.ts:41-43 | Usa variavel CORS_ORIGINS |

---

### 1.2 Vulnerabilidades PENDENTES

#### SEC-002: Validacao de Magic Bytes em Upload (MEDIO)

**Arquivo:** `src/config/multer.config.ts:36-44`
**Problema:** A funcao `validatePdfMagicBytes` existe mas nao e chamada no fluxo de upload.

**Codigo Atual:**
```typescript
fileFilter: async (req: Request, file: Express.Multer.File, cb: any) => {
    if (file.mimetype !== 'application/pdf') {
        return cb(new Error('Only PDF files are allowed!'), false);
    }
    // Note: This will be validated in the upload handler
    cb(null, true);
},
```

**Solucao Sugerida:**

Adicionar em `src/modules/knowledge-base/application/use-cases/upload-philosophy.use-case.ts`:

```typescript
import { validatePdfMagicBytes } from '../../../../config/multer.config';
import * as fs from 'fs/promises';

async execute(userId: string, file: Express.Multer.File, title: string) {
    // SEC-002: Validar magic bytes do PDF
    const isValidPdf = await validatePdfMagicBytes(file.path);
    if (!isValidPdf) {
        await fs.unlink(file.path); // Remover arquivo invalido
        throw new BadRequestException('Arquivo PDF invalido ou corrompido');
    }

    // ... resto do codigo existente
}
```

---

#### SEC-017: Secrets Separados para Access/Refresh Token (BAIXO)

**Arquivo:** `src/modules/auth/domain/services/token.service.ts:26-34`
**Problema:** Fallback para mesmo secret se variaveis especificas nao existirem.

**Codigo Atual:**
```typescript
secret: this.configService.get('JWT_ACCESS_SECRET') || this.configService.get('JWT_SECRET'),
```

**Solucao Sugerida:**

Para producao, configurar no `.env.production`:
```env
JWT_SECRET=chave-base-64-caracteres-minimo
JWT_ACCESS_SECRET=chave-diferente-para-access-token
JWT_REFRESH_SECRET=chave-diferente-para-refresh-token
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
```

Opcionalmente, forcar em producao:
```typescript
const accessSecret = this.configService.get('JWT_ACCESS_SECRET');
const baseSecret = this.configService.get('JWT_SECRET');

if (process.env.NODE_ENV === 'production' && !accessSecret) {
    throw new Error('JWT_ACCESS_SECRET is required in production');
}

return this.jwtService.sign(payload, {
    secret: accessSecret || baseSecret,
    expiresIn: this.configService.get('JWT_ACCESS_EXPIRATION'),
});
```

---

## 2. Analise de Arquitetura

### 2.1 Clean Architecture - IMPLEMENTADA

**Estrutura de Modulos:**
```
src/modules/<module>/
├── application/           # Camada de Aplicacao
│   ├── dtos/             # Data Transfer Objects (entrada/saida)
│   ├── interfaces/       # Contratos de repositorios
│   └── use-cases/        # Casos de uso (regras de negocio)
├── domain/               # Camada de Dominio
│   ├── entities/         # Entidades de dominio
│   ├── enums/           # Enumeracoes
│   └── services/        # Servicos de dominio
└── infrastructure/       # Camada de Infraestrutura
    ├── controllers/      # Controllers HTTP
    ├── repositories/     # Implementacoes de repositorio
    ├── guards/          # Guards de autenticacao
    ├── decorators/      # Decorators customizados
    └── strategies/      # Estrategias (Passport, etc)
```

**Principios SOLID Observados:**

| Principio | Status | Exemplo |
|-----------|--------|---------|
| Single Responsibility | BOM | Cada use-case tem uma unica responsabilidade |
| Open/Closed | BOM | Strategy pattern para LLM providers |
| Liskov Substitution | BOM | IUserRepository implementacoes |
| Interface Segregation | BOM | Interfaces especificas por modulo |
| Dependency Inversion | BOM | Use-cases dependem de interfaces |

---

### 2.2 Repository Pattern - PARCIALMENTE IMPLEMENTADO

**Modulos com Repository Pattern:**

| Modulo | Interface | Implementacao | Status |
|--------|-----------|---------------|--------|
| Users | IUserRepository | PrismaUserRepository | COMPLETO |
| Assets | IAssetRepository | PrismaAssetRepository | COMPLETO |
| Knowledge-Base | - | PrismaService direto | PENDENTE |
| Alerts | - | PrismaService direto | PENDENTE |
| Dashboard | - | PrismaService direto | PENDENTE |

**Exemplo de Implementacao Correta (Users):**

```typescript
// Interface: src/modules/users/application/interfaces/user-repository.interface.ts
export interface IUserRepository {
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    create(data: CreateUserDto): Promise<User>;
    update(id: string, data: UpdateUserDto): Promise<User>;
    delete(id: string): Promise<void>;
    findAll(options: PaginationOptions): Promise<PaginatedResult<User>>;
}

// Implementacao: src/modules/users/infrastructure/repositories/prisma-user.repository.ts
@Injectable()
export class PrismaUserRepository implements IUserRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findById(id: string): Promise<User | null> {
        return this.prisma.user.findFirst({
            where: { id, deletedAt: null }
        });
    }
    // ...
}

// Injecao: src/modules/users/users.module.ts
providers: [
    { provide: 'IUserRepository', useClass: PrismaUserRepository },
]
```

---

### 2.3 Tratamento de Erros - IMPLEMENTADO

**Global Exception Filter:** `src/common/filters/all-exceptions.filter.ts`

- Captura todas as excecoes
- Respostas padronizadas com statusCode, message, error, timestamp, path
- Nao expoe stack traces em producao
- Logs estruturados com metodo, URL e status

**Excecoes Customizadas Usadas:**
- `ConflictException` - Recursos duplicados (email, ticker)
- `NotFoundException` - Recursos nao encontrados
- `UnauthorizedException` - Falha de autenticacao
- `ForbiddenException` - Acesso negado / CSRF invalido
- `BadRequestException` - Dados de entrada invalidos

---

## 3. Analise de Seguranca Detalhada

### 3.1 Autenticacao e Sessao

**Implementacao Atual:**

| Aspecto | Implementacao | Arquivo |
|---------|---------------|---------|
| Tokens | JWT em HttpOnly Cookies | auth.controller.ts:86-102 |
| Access Token TTL | 15 minutos | auth.controller.ts:93 |
| Refresh Token TTL | 7 dias | auth.controller.ts:100 |
| SameSite | Strict | auth.controller.ts:92,99 |
| Secure Flag | Condicional (prod only) | auth.controller.ts:91,98 |
| Password Hash | bcrypt 10 rounds | password.service.ts:6 |

**Fluxo de Autenticacao:**
```
1. POST /auth/login → Valida credenciais → Set-Cookie (access_token, refresh_token)
2. Requisicoes autenticadas → Cookie enviado automaticamente → JWT extraido
3. Token expirado → POST /auth/refresh → Novo access_token
4. POST /auth/logout → Clear cookies
```

---

### 3.2 Protecao CSRF

**Implementacao:** Double Submit Cookie Pattern

**Arquivo:** `src/common/middleware/csrf.middleware.ts`

```typescript
// 1. Gera token com crypto.randomBytes(32)
// 2. Armazena em cookie XSRF-TOKEN (httpOnly: false para frontend ler)
// 3. Frontend envia em header X-XSRF-TOKEN
// 4. Middleware compara cookie vs header
```

**Frontend:** `frontend/lib/api/client.ts:14-29`
- Interceptor le cookie XSRF-TOKEN
- Adiciona header X-XSRF-TOKEN em POST/PUT/PATCH/DELETE

---

### 3.3 Rate Limiting

**Configuracao Global:** `src/app.module.ts`
- 100 requisicoes por minuto por IP

**Configuracao por Endpoint:**

| Endpoint | Limite | TTL | Arquivo |
|----------|--------|-----|---------|
| POST /auth/login | 5 req | 60s | auth.controller.ts:35 |
| POST /auth/register | 3 req | 60s | auth.controller.ts:20 |
| POST /auth/refresh | 3 req | 60s | auth.controller.ts:50 |

---

### 3.4 Validacao de Input

**Global Validation Pipe:** `src/main.ts:32-38`

```typescript
app.useGlobalPipes(new ValidationPipe({
    whitelist: true,           // Remove propriedades nao declaradas
    forbidNonWhitelisted: true, // Rejeita requisicao com props extras
    transform: true,           // Converte tipos automaticamente
}));
```

**Exemplo de DTO com Validacao:**
```typescript
// src/modules/auth/application/dtos/register.input.ts
export class RegisterInput {
    @IsEmail({}, { message: 'Email invalido' })
    @IsNotEmpty({ message: 'Email e obrigatorio' })
    email: string;

    @IsString()
    @IsNotEmpty({ message: 'Senha e obrigatoria' })
    @MinLength(8, { message: 'Senha deve ter no minimo 8 caracteres' })
    password: string;

    @IsOptional()
    @IsString()
    @MinLength(2, { message: 'Nome deve ter no minimo 2 caracteres' })
    name?: string;
}
```

---

### 3.5 Headers de Seguranca

**Implementacao com Helmet:** `src/main.ts:19-29`

```typescript
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
        },
    },
    crossOriginEmbedderPolicy: false, // Necessario para Swagger
}));
```

---

## 4. Analise de Performance

### 4.1 Banco de Dados

**Indices Implementados:**

| Tabela | Campo(s) | Tipo | Arquivo |
|--------|----------|------|---------|
| philosophies | userId | BTREE | schema.prisma:43 |
| assets | sector | BTREE | schema.prisma:87 |
| assets | type | BTREE | schema.prisma:88 |
| strategy_profiles | userId | BTREE | schema.prisma:114 |
| strategy_profiles | isActive | BTREE | schema.prisma:115 |
| price_alerts | userId | BTREE | schema.prisma:134 |
| price_alerts | assetId | BTREE | schema.prisma:135 |
| price_alerts | isActive | BTREE | schema.prisma:136 |
| wallets | userId | BTREE | schema.prisma:153 |
| wallet_assets | walletId | BTREE | schema.prisma:175 |
| wallet_assets | assetId | BTREE | schema.prisma:176 |

**Tipos Decimal para Dados Financeiros:**

| Campo | Precisao | Arquivo |
|-------|----------|---------|
| currentPrice | Decimal(12,2) | schema.prisma:70 |
| dividendYield | Decimal(5,4) | schema.prisma:71 |
| priceToEarnings | Decimal(8,2) | schema.prisma:72 |
| priceToBook | Decimal(8,2) | schema.prisma:73 |
| roe | Decimal(5,4) | schema.prisma:74 |
| netMargin | Decimal(5,4) | schema.prisma:75 |
| debtToEquity | Decimal(8,2) | schema.prisma:76 |
| targetPrice (alerts) | Decimal(10,2) | schema.prisma:123 |
| quantity (wallet) | Decimal(18,8) | schema.prisma:167 |
| averagePrice (wallet) | Decimal(12,2) | schema.prisma:168 |

---

### 4.2 Melhorias de Performance Sugeridas

#### PERF-001: Implementar Cache Redis para Queries Frequentes (MEDIO)

**Problema:** Consultas repetidas ao banco para dados que mudam raramente.

**Solucao Sugerida:**

```typescript
// src/common/services/cache.service.ts
@Injectable()
export class CacheService {
    constructor(
        @InjectRedis() private readonly redis: Redis,
    ) {}

    async getOrSet<T>(
        key: string,
        ttlSeconds: number,
        factory: () => Promise<T>
    ): Promise<T> {
        const cached = await this.redis.get(key);
        if (cached) {
            return JSON.parse(cached);
        }

        const value = await factory();
        await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
        return value;
    }

    async invalidate(pattern: string): Promise<void> {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
            await this.redis.del(...keys);
        }
    }
}

// Uso em use-case:
async execute(): Promise<Asset[]> {
    return this.cacheService.getOrSet(
        'assets:list:all',
        300, // 5 minutos
        () => this.assetRepository.findAll()
    );
}
```

---

#### PERF-002: Eager Loading para Evitar N+1 (BAIXO)

**Problema Potencial:** Queries separadas para relacionamentos.

**Solucao:**

```typescript
// Em vez de:
const wallets = await this.prisma.wallet.findMany({ where: { userId } });
for (const wallet of wallets) {
    wallet.assets = await this.prisma.walletAsset.findMany({ where: { walletId: wallet.id } });
}

// Usar:
const wallets = await this.prisma.wallet.findMany({
    where: { userId },
    include: {
        assets: {
            include: { asset: true }
        }
    }
});
```

---

## 5. Analise de Qualidade de Codigo

### 5.1 Cobertura de Testes

**Arquivos de Teste Encontrados:** 28

| Modulo | Use-Cases | Controllers | Services | Total |
|--------|-----------|-------------|----------|-------|
| Users | 5 | 1 | - | 6 |
| Assets | 6 | 1 | - | 7 |
| Auth | 2 | 1 | - | 3 |
| Knowledge-Base | 4 | 1 | 1 | 6 |
| Dashboard | 4 | 1 | - | 5 |
| App | - | 1 | - | 1 |

**Cobertura Estimada:** ~40% (significativa melhora de 5%)

**Proximos Passos:**
- [ ] Adicionar testes E2E para fluxos criticos
- [ ] Testes para modulo Alerts
- [ ] Testes para Jobs/Background Processing

---

### 5.2 Problemas de Qualidade Menores

#### QUAL-001: Uso de `any` em Exception Filter (BAIXO)

**Arquivo:** `src/common/filters/all-exceptions.filter.ts:29`

```typescript
// Atual
const responseObj = exceptionResponse as any;

// Sugerido
interface ExceptionResponseObject {
    message?: string | string[];
    error?: string;
    statusCode?: number;
}
const responseObj = exceptionResponse as ExceptionResponseObject;
```

---

#### QUAL-002: Excecoes Genericas em Entities (BAIXO)

**Arquivo:** `src/modules/assets/domain/entities/asset.entity.ts`

**Sugerido:** Criar excecoes de dominio especificas:

```typescript
// src/common/exceptions/domain.exception.ts
export class DomainException extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'DomainException';
    }
}

export class InvalidTickerException extends DomainException {
    constructor(ticker: string) {
        super(`Ticker invalido: ${ticker}`);
    }
}
```

---

#### QUAL-003: Codigo Duplicado no Frontend - Error Handler (BAIXO)

**Problema:** Toast de erro repetido em multiplos componentes.

**Sugerido:**

```typescript
// frontend/lib/utils/error-handler.ts
import { AxiosError } from 'axios';

export function getErrorMessage(error: unknown): string {
    if (error instanceof AxiosError) {
        return error.response?.data?.message || 'Erro na requisicao';
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'Erro inesperado';
}

export function handleApiError(error: unknown, toast: (props: any) => void) {
    toast({
        title: 'Erro',
        description: getErrorMessage(error),
        variant: 'destructive',
    });
}
```

---

## 6. Analise de Infraestrutura

### 6.1 Docker Compose - Producao

**Arquivo:** `docker-compose.prod.yml`

| Aspecto | Status | Detalhes |
|---------|--------|----------|
| Health Checks | IMPLEMENTADO | Todos os servicos |
| Resource Limits | IMPLEMENTADO | CPU e memoria definidos |
| Restart Policy | IMPLEMENTADO | unless-stopped |
| Portas Sensiveis | PROTEGIDO | DB e Redis nao expostos |
| Autenticacao Redis | IMPLEMENTADO | --requirepass |
| Variaveis de Ambiente | IMPLEMENTADO | Todas externalizadas |

**Limites de Recursos Configurados:**

| Servico | CPU Limit | Memory Limit | CPU Reserved | Memory Reserved |
|---------|-----------|--------------|--------------|-----------------|
| app (API) | 1.0 | 1G | 0.5 | 512M |
| db (PostgreSQL) | 0.5 | 512M | - | - |
| redis | 0.25 | 256M | - | - |
| frontend | 0.5 | 512M | - | - |

---

### 6.2 Melhorias de Infraestrutura Sugeridas

#### INFRA-001: Adicionar Usuario Nao-Root nos Containers (BAIXO)

**Arquivo:** `Dockerfile`

```dockerfile
# Adicionar apos instalacao de dependencias
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
```

---

#### INFRA-002: Read-Only Root Filesystem (BAIXO)

**Arquivo:** `docker-compose.prod.yml`

```yaml
services:
  app:
    # ... outras configs
    read_only: true
    tmpfs:
      - /tmp
    volumes:
      - ./uploads:/usr/src/app/uploads
```

---

## 7. Plano de Acao Priorizado

### Fase 1: Sprint Atual (Prioridade Alta)

| ID | Acao | Esforco | Impacto |
|----|------|---------|---------|
| SEC-002 | Implementar validacao de magic bytes no upload | 2h | Alto |
| SEC-017 | Documentar e configurar JWT secrets separados | 1h | Medio |
| TEST-001 | Adicionar testes E2E para auth flow | 4h | Alto |
| TEST-002 | Adicionar testes E2E para CRUD assets | 4h | Alto |

### Fase 2: Proximas 2 Sprints (Prioridade Media)

| ID | Acao | Esforco | Impacto |
|----|------|---------|---------|
| PERF-001 | Implementar cache Redis para queries | 8h | Medio |
| ARCH-001 | Completar Repository Pattern (Knowledge-Base, Alerts) | 6h | Medio |
| QUAL-001 | Remover uso de `any` e melhorar tipos | 4h | Baixo |
| DOC-001 | Adicionar JSDoc em use-cases publicos | 4h | Baixo |

### Fase 3: Melhorias Continuas (Prioridade Baixa)

| ID | Acao | Esforco | Impacto |
|----|------|---------|---------|
| INFRA-001 | Usuario nao-root nos containers | 2h | Baixo |
| QUAL-002 | Criar excecoes de dominio especificas | 3h | Baixo |
| QUAL-003 | Extrair error handler no frontend | 2h | Baixo |
| PERF-002 | Revisar queries para eager loading | 4h | Baixo |

---

## 8. Metricas de Acompanhamento

| Metrica | Auditoria 1.0 | Auditoria 2.0 | Target Q2 |
|---------|---------------|---------------|-----------|
| Vulnerabilidades Criticas | 5 | 0 | 0 |
| Vulnerabilidades Altas | 10 | 0 | 0 |
| Vulnerabilidades Medias | 5 | 2 | 0 |
| Cobertura de Testes Backend | 5% | ~40% | 70% |
| Cobertura de Testes Frontend | 0% | 0% | 40% |
| Uso de `any` | 20+ | ~10 | 0 |
| Modulos com Repository Pattern | 0 | 2 | 5 |

---

## 9. Conclusao

A plataforma InvestIA demonstrou **evolucao significativa** entre as auditorias:

### Pontos Fortes
- Todas as vulnerabilidades criticas foram corrigidas
- Autenticacao segura com HttpOnly Cookies + CSRF
- Clean Architecture bem implementada
- Documentacao tecnica completa
- Infraestrutura Docker preparada para producao
- Cobertura de testes aumentou de 5% para ~40%

### Pontos de Atencao
- Validacao de magic bytes no upload ainda pendente
- Cache de queries nao implementado
- Repository Pattern incompleto em alguns modulos
- Testes E2E ainda limitados

### Recomendacao Final
A plataforma esta em **bom estado para desenvolvimento** e com as correcoes da Fase 1 estara **pronta para producao** em ambiente controlado.

---

## Referencias

- [OWASP Top 10 2021](https://owasp.org/Top10/)
- [NestJS Security Best Practices](https://docs.nestjs.com/security/helmet)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)
- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)

---

**Documento gerado por Claude Code (Opus 4.5)**
**Proxima revisao programada:** Apos conclusao da Fase 1
