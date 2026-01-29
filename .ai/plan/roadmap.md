# 🗺️ Roadmap - InvestIA

## Q1 2026 - MVP

### Janeiro ✅ **CONCLUÍDO**
- [x] Setup Docker + NestJS  
- [x] Estrutura Clean Architecture
- [x] Módulos base (MarketData, KnowledgeBase, AnalysisEngine)
- [x] **Autenticação JWT** (Access + Refresh Tokens)
- [x] **CRUD completo de Ativos** (com filtros e indicadores)
- [x] **Jobs de sincronização automática** (BullMQ + Brapi)
- [x] **Upload e processamento de PDFs** (extração de texto e regras)
- [x] **Testes E2E** (12/12 passed)
- [x] **Rate Limiting** (proteção contra abuso)

### Fevereiro 🚀
- [ ] **CI/CD Pipeline** (GitHub Actions)
- [ ] **Dashboard Frontend** (React/Next.js)
- [ ] **Melhorias na extração de regras** (LLM/NLP avançado)
- [ ] **Alertas de preço** (notificações quando ativo atinge target)

### Março
- [ ] **Ranking de ativos** (score por estratégia)
- [ ] **Múltiplas carteiras** por usuário
- [ ] **Histórico de operações** (log de compras/vendas)
- [ ] **Integração Telegram** (bot de notificações)

---

## Q2 2026 - Funcionalidades Core

### Abril-Maio
- [ ] **Frontend Web completo** (Dashboard interativo)
- [ ] **Comparativo de ativos** (análise lado-a-lado)
- [ ] **Relatórios de performance** (gráficos e métricas)

### Junho
- [ ] **Integração B3** (importar extratos via API)
- [ ] **Notificações push** (email + Telegram)
- [ ] **API pública** (webhooks para terceiros)

---

## Q3 2026 - Escala

- [ ] **Multi-tenancy** (SaaS)
- [ ] **Mobile App** (React Native)
- [ ] **Análise avançada** (ML para predição de tendências)

---

## Métricas de Sucesso

| Métrica | Target Q1 | Status Atual | Target Q2 |
|---------|-----------|--------------|-----------|
| Usuários Beta | 10 | 0 | 100 |
| Ativos cadastrados | 100 | ~20 (teste) | 500 |
| Uptime | 99% | 100% (dev) | 99.9% |
| Cobertura de Testes | 60% | 75% (E2E) | 90% |
