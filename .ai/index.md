# 🤖 InvestIA - Sistema de Desenvolvimento com IA

> Framework de documentação e agents para desenvolvimento assistido por IA

## Estrutura

```
.ai/
├── index.md                    # Este arquivo
├── plan/                       # Planejamento e tracking de atividades
│   ├── backlog.md              # Backlog de features
│   ├── sprint-atual.md         # Sprint em andamento
│   └── roadmap.md              # Visão de longo prazo
├── docs/                       # Regras arquiteturais e de negócio
│   ├── architecture.md         # Decisões arquiteturais
│   ├── business-rules.md       # Regras de negócio
│   ├── api-guidelines.md       # Padrões de API
│   └── database-conventions.md # Convenções de banco
└── agents/                     # Personas/Skills para cada tarefa
    ├── backend-developer.md    # Dev Backend NestJS
    ├── frontend-developer.md   # Dev Frontend React
    ├── architect.md            # Arquiteto de Software
    ├── qa-engineer.md          # QA/Testes
    └── devops.md               # DevOps/Infra
```

## Como usar

### 1. Antes de pedir ajuda à IA

1. Leia o agent apropriado em `agents/` para entender o contexto
2. Referencie os docs de arquitetura quando relevante
3. Atualize o `plan/` com status das atividades

### 2. Prompts eficazes

Ao interagir com a IA, sempre inclua:
- **Contexto**: Qual módulo/componente está trabalhando
- **Objetivo**: O que quer alcançar
- **Restrições**: Regras de negócio ou arquiteturais relevantes

### 3. Workflow recomendado

```
1. Consultar agent apropriado → 2. Desenvolver → 3. Atualizar plan/
```

---

**Stack do Projeto:**
- Backend: NestJS + Clean Architecture + Prisma
- Database: PostgreSQL
- Queue: BullMQ + Redis
- Infra: Docker Compose
