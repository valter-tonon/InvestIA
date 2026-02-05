# 🏗️ Arquitetura - InvestIA

## Visão Geral

O InvestIA segue **Clean Architecture** com as seguintes camadas:

```
┌─────────────────────────────────────────────────┐
│                  Controllers                     │ ← HTTP/REST
├─────────────────────────────────────────────────┤
│                  Use Cases                       │ ← Regras de Aplicação
├─────────────────────────────────────────────────┤
│                  Entities                        │ ← Regras de Negócio
├─────────────────────────────────────────────────┤
│                Infrastructure                    │ ← DB, APIs, Queue
└─────────────────────────────────────────────────┘
```

---

## Estrutura de Diretórios

```
src/
├── infrastructure/          # Camada externa
│   ├── database/            # Prisma, migrações
│   └── http/                # Controllers, DTOs
├── modules/                 # Bounded Contexts
│   ├── market-data/         # Cotações, indicadores
│   │   ├── application/     # Use Cases
│   │   ├── domain/          # Entities, Value Objects
│   │   ├── infrastructure/  # Repositories, APIs
│   │   └── jobs/            # Background workers
│   ├── knowledge-base/      # IA, estratégias
│   └── analysis-engine/     # Motor de regras
└── shared/                  # Utilitários comuns
```

---

## Princípios

### 1. Dependency Rule
> Dependências sempre apontam para dentro (camadas mais estáveis)

```
Controllers → Use Cases → Entities ← Repositories
```

### 2. Use Cases Isolados
Cada Use Case deve:
- Ter uma única responsabilidade
- Receber Input DTO, retornar Output DTO
- Não conhecer HTTP, DB específico

### 3. Entities Puras
- Sem decorators de framework
- Sem imports de infraestrutura
- Validação de regras de negócio

---

## Padrões de Código

### Nomenclatura

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Use Case | `VerbNounUseCase` | `CreateAssetUseCase` |
| Service | `NounService` | `MarketDataService` |
| Repository | `NounRepository` | `AssetRepository` |
| Controller | `NounController` | `AssetController` |
| DTO Input | `VerbNounInput` | `CreateAssetInput` |
| DTO Output | `NounOutput` | `AssetOutput` |

### Estrutura de Módulo

```typescript
// Cada módulo deve ter:
├── module.ts           // NestJS Module
├── application/
│   └── use-cases/      // Use Cases
├── domain/
│   ├── entities/       // Entidades
│   └── repositories/   // Interfaces
├── infrastructure/
│   ├── repositories/   // Implementações
│   └── mappers/        // Entity <-> DTO
```

---

## Decisões Arquiteturais (ADRs)

### ADR-001: Prisma como ORM
**Contexto**: Precisamos de ORM type-safe  
**Decisão**: Usar Prisma  
**Consequência**: Migrações gerenciadas, mas lock-in maior

### ADR-002: BullMQ para Jobs
**Contexto**: Jobs assíncronos (sync cotações)  
**Decisão**: BullMQ + Redis  
**Consequência**: Retry automático, mas dependência de Redis

### ADR-003: Motor de Regras Dinâmico
**Contexto**: Regras de investimento variáveis por usuário  
**Decisão**: Regras em JSON no banco, avaliação dinâmica  
**Consequência**: Flexibilidade total, mas sem compile-time safety

### ADR-004: Arquitetura de Prompts Modulares
**Contexto**: A lógica de prompts estava acoplada aos Providers, dificultando a criação de novos modos de análise.
**Decisão**: Implementar Padrão Strategy (`PromptStrategy`).
**Consequência**: Desacoplamento total. Prompts viram classes isoladas, permitindo "Modos de Análise" plugáveis (Barsi, Graham, etc.). Ver [rules_engine.md](./rules_engine.md).
