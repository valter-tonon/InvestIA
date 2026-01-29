# 📋 Backlog - InvestIA

## Prioridade Alta 🔴

### Próximos (Sprint 2)
- [ ] **CI/CD Pipeline** - GitHub Actions para build, test e deploy automático
- [ ] **Dashboard Frontend** - Interface web para consultar ativos e filosofias
- [ ] **Extração avançada de regras** - Integrar LLM (OpenAI/Claude) para melhor parsing

---

## Prioridade Média 🟡

- [ ] **Dashboard de carteira** - Visualização de ativos e performance com gráficos
- [ ] **Alertas de preço** - Notificações quando ativo atinge target configurado
- [ ] **Ranking de ativos** - Listar ativos por score de acordo com estratégia
- [ ] **Testes Unitários** - Expandir cobertura além dos E2E

---

## Prioridade Baixa 🟢

- [ ] **Integração B3** - Importar extratos e operações via API oficial
- [ ] **Múltiplas carteiras** - Suporte a carteiras separadas por objetivo
- [ ] **Histórico de operações** - Log completo de compras/vendas com P&L
- [ ] **Integração Telegram** - Bot para notificações e comandos
- [ ] **Seed Data** - Dados de exemplo para desenvolvimento

---

## Concluídos ✅

### Infraestrutura Base
- [x] Setup Docker (PostgreSQL + Redis + NestJS)
- [x] Schema Prisma (User, Asset, Philosophy, Wallet)
- [x] Estrutura Clean Architecture (Domain, Application, Infrastructure)

### Módulos Core
- [x] Módulo MarketData (busca cotações Brapi)
- [x] Módulo AnalysisEngine (motor de regras dinâmicas)
- [x] Módulo KnowledgeBase (ingestão de filosofias)

### Features Completas (Sprint 1)
- [x] **CRUD Users** - Endpoints básicos de usuários
- [x] **CRUD Assets** - Gestão completa de ativos financeiros com filtros
- [x] **Autenticação JWT** - Access + Refresh Token com bcrypt e guards
- [x] **Documentação Swagger** - UI interativa em `/api`
- [x] **Sincronização automática** - Job BullMQ diário via Brapi (batching inteligente)
- [x] **Upload de filosofias** - PDF upload + extração de texto e regras (regex)
- [x] **Testes E2E** - Cobertura completa: Auth, Assets, Philosophies (12/12 passed)
- [x] **Rate Limiting** - Throttling global (100/min) e customizado:
  - Login: 5/min (brute force protection)
  - Register: 3/min (spam protection)
  - Upload: 10/min (operação pesada)

---

## Estatísticas do Projeto

**Última atualização**: 29/01/2026

| Métrica | Valor |
|---------|-------|
| Módulos implementados | 7 |
| Endpoints criados | ~25 |
| Testes E2E | 12/12 ✅ |
| Uptime (dev) | 100% |
| Rate Limits configurados | 4 |
| PDFs processados | ~5 (teste) |
