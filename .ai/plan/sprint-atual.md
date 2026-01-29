# 🏃 Sprint Atual

**Sprint**: 2  
**Período**: Fev/2026  
**Foco**: Qualidade & Automação

---

## Sprint 1 - Janeiro ✅ **CONCLUÍDA**

Todas as tarefas da Sprint 1 foram concluídas com sucesso:

- [x] CRUD Users (endpoints básicos)
- [x] CRUD Assets (cadastro de ativos)
- [x] Autenticação JWT (Access + Refresh Tokens)
- [x] Documentação Swagger (UI interativa)
- [x] Job de Sincronização Automática (BullMQ)
- [x] Upload de Filosofias (PDF + extração de regras)
- [x] Testes E2E (12/12 passed)
- [x] Rate Limiting (proteção contra abuso)

**Principais Entregas:**
- ✅ API completa e documentada em `/api`
- ✅ Testes automatizados E2E
- ✅ Proteção contra brute force e spam
- ✅ Sincronização diária automática de cotações

---

## Sprint 2 - Fevereiro 🚀 **EM PLANEJAMENTO**

### Objetivos
Melhorar a automação e iniciar o frontend.

### Em Progresso 🔄

| Task | Prioridade | Status |
|------|------------|--------|
| CI/CD Pipeline | Alta | 📝 A fazer |
| Dashboard Frontend | Alta | 📝 A fazer |

### A Fazer 📝

- [ ] **CI/CD com GitHub Actions**
  - Build automático
  - Testes E2E no CI
  - Deploy staging

- [ ] **Dashboard Básico (Frontend)**
  - Next.js + TailwindCSS
  - Páginas: Login, Assets, Philosophies
  - Gráficos de performance

- [ ] **Melhorias na Extração**
  - Integrar LLM para extração de regras
  - Suporte a mais tipos de indicadores

---

## Bloqueados ⛔

*Nenhum no momento*

---

## Notas da Sprint

- **API**: http://localhost:3001
- **Swagger**: http://localhost:3001/api
- **Containers**: investia-api, investia-db, investia-redis
- **Testes**: `npm run test:e2e` (12/12 passing)
- **Rate Limits**: Login 5/min, Register 3/min, Upload 10/min

---

## Retrospectiva Sprint 1

### 👍 O que funcionou bem
- Clean Architecture facilitou expansão
- Testes E2E garantiram qualidade
- Rate Limiting protegeu API desde o início

### 👎 O que melhorar
- Adicionar testes unitários (além de E2E)
- Documentar melhor o processo de setup local
- Criar seed data para desenvolvimento

### 💡 Ações para próxima sprint
- Implementar CI/CD para automatizar deploys
- Iniciar frontend para validar UX
- Refatorar extraction service com LLM
