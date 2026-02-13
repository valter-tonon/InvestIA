# Roadmap - InvestIA

**Ultima Atualizacao:** 04/02/2026
**Versao:** 3.0 (Foco Brasil)

---

## Visao do Produto

> "A plataforma brasileira de Value Investing com Inteligencia Artificial"

Transformar filosofias de investimento (Barsi, Bazin, Graham) em estrategias automatizadas.
Upload seu livro favorito, deixe a IA extrair as regras, e receba alertas
quando encontrar acoes que se encaixam no seu perfil.

**Mercado-alvo:** Investidores brasileiros de longo prazo (B3)

---

## Q1 2026 - MVP

### Janeiro - CONCLUIDO

- [x] Setup Docker + NestJS
- [x] Estrutura Clean Architecture
- [x] Modulos base (MarketData, KnowledgeBase, AnalysisEngine)
- [x] Autenticacao JWT (Access + Refresh Tokens)
- [x] CRUD completo de Ativos (com filtros e indicadores)
- [x] Jobs de sincronizacao automatica (BullMQ + Brapi)
- [x] Upload e processamento de PDFs (extracao de texto e regras)
- [x] Testes E2E (12/12 passed)
- [x] Rate Limiting (protecao contra abuso)

### Fevereiro - CONCLUIDO ✅

**Concluido:**
- [x] Frontend - Autenticacao (Login e Registro)
- [x] Paginas de Assets no Frontend
- [x] Paginas de Philosophies no Frontend
- [x] Extracao de regras com LLM (OpenAI + Gemini)
- [x] Dashboard com graficos interativos
- [x] Refatoracao Arquitetural (Repository Pattern, Soft Delete, CSRF)
- [x] Seguranca (HttpOnly Cookies, Helmet, Rate Limiting avancado)
- [x] CI/CD Pipeline (GitHub Actions completo)
- [x] Frontend de Alertas (pagina + componentes + testes E2E)

### Marco - CONCLUIDO ✅

**MVP COMERCIALIZAVEL - Todas as features entregues:**

- [x] **Historico de Dividendos**
  - Modulo completo backend (sync-dividends, get-dividend-history)
  - 4 componentes frontend (Chart, Table, DataTable, Summary)
  - Integracao Brapi
  - Endpoint: `GET /assets/:id/dividends`

- [x] **Preco Teto / Fair Price**
  - Calculo Bazin (DY / 0.06)
  - Calculo Barsi (Media 5 anos DY / 0.06)
  - Calculo Graham (em andamento)
  - Yield on Cost automatico
  - Endpoint: `GET /assets/:id/fair-price`
  - Recomendacao: COMPRA/VENDA/NEUTRO

- [x] **Ranking de Ativos**
  - Endpoint com estrategias (COMPOSITE, BAZIN, BARSI, GRAHAM)
  - Score 0-100 por ativo
  - Frontend completo com filtros
  - Endpoint: `GET /ranking?strategy=X&limit=N`

- [x] **Sistema de Carteiras**
  - Frontend de gerenciamento
  - Integracao com portfolio
  - Metricas por carteira

**Prioridade MAXIMA (Value Investing BR):**

| Feature | Descricao | Esforco | Status |
|---------|-----------|---------|--------|
| Historico Dividendos | Endpoint + grafico ultimos 10 anos | 8h | A fazer |
| Preco Teto Bazin | Calculo: Ultimo DY / 0.06 | 4h | A fazer |
| Preco Teto Barsi | Calculo: Media DY 5 anos / 0.06 | 4h | A fazer |
| Preco Justo Graham | Formula: sqrt(22.5 * LPA * VPA) | 4h | A fazer |
| Yield on Cost | Dividendo Anual / Preco Medio | 4h | A fazer |
| Badge Preco Teto | Indicador visual abaixo/acima | 2h | A fazer |

**Prioridade ALTA (Core Features):**

| Feature | Descricao | Esforco | Status |
|---------|-----------|---------|--------|
| Ranking de Ativos | Score por estrategia/filosofia | 16h | A fazer |
| Multiplas Carteiras | CRUD carteiras por usuario | 12h | A fazer |
| Notif. Rebalanceamento | Alertar Abril/Outubro (Bazin) | 8h | A fazer |

---

## Q2 2026 - Monetizacao e Administracao - EM ANDAMENTO ⏳

### Status Atual (12/02/2026)
Durante auditoria de codigo descobriu-se que **parte do Q2 ja foi implementado**:

**✅ Ja Implementado (~40%):**
- [x] Modulo Admin backend completo
- [x] Painel SuperAdmin frontend (5 paginas)
  - Dashboard principal
  - Gestao de usuarios
  - Gestao de assinaturas
  - Analytics/Metricas
  - Activity Logs
- [x] Layout especifico para area admin

**❌ Pendente de Implementacao:**
- [ ] Modelos de plano (Free/Pro/Premium)
- [ ] Integracao gateway de pagamento
- [ ] Feature flags por plano
- [ ] Checkout flow
- [ ] Webhooks de pagamento
- [ ] Trial period (7 dias)

### Abril - Sistema de Assinaturas + Painel Admin

**Prioridade MAXIMA (Monetizacao):**

| Feature | Descricao | Esforco | Status |
|---------|-----------|---------|--------|
| Planos de Assinatura | Free, Pro, Premium | 8h | A fazer |
| Integracao Stripe | Pagamentos recorrentes | 16h | A fazer |
| Checkout Flow | Tela de upgrade/pagamento | 12h | A fazer |
| Feature Flags | Limitar features por plano | 8h | A fazer |
| Trial Period | 7 dias gratis no Pro | 4h | A fazer |

**Painel SuperAdmin:**

| Feature | Descricao | Esforco | Status |
|---------|-----------|---------|--------|
| Dashboard Admin | Metricas gerais do sistema | 12h | A fazer |
| Gestao de Usuarios | CRUD, busca, filtros, status | 16h | A fazer |
| Gestao de Assinaturas | Visualizar, cancelar, estender | 12h | A fazer |
| Metricas Financeiras | MRR, churn, LTV, conversao | 8h | A fazer |
| Logs de Atividade | Acoes de usuarios e sistema | 8h | A fazer |
| Configuracoes Globais | Limites, taxas, manutencao | 4h | A fazer |

**Cronograma Abril:**

```
Semana 1 (01-07 Abr):
├── Modelo de Planos (Free/Pro/Premium)
├── Tabela Subscriptions no banco
└── Feature Flags por plano

Semana 2 (08-14 Abr):
├── Integracao Stripe (backend)
├── Webhooks de pagamento
└── Gestao de status da assinatura

Semana 3 (15-21 Abr):
├── Checkout Flow (frontend)
├── Tela Minha Assinatura
└── Upgrade/Downgrade de plano

Semana 4 (22-30 Abr):
├── Painel SuperAdmin (dashboard)
├── Gestao de Usuarios
└── Gestao de Assinaturas
```

### Maio - Admin Avancado + Melhorias

| Feature | Descricao | Esforco | Prioridade |
|---------|-----------|---------|------------|
| Metricas Financeiras | Graficos de MRR, churn, etc. | 12h | Alta |
| Logs de Atividade | Auditoria de acoes | 12h | Alta |
| Exportar Dados | CSV de usuarios/assinaturas | 4h | Media |
| Notificacoes Admin | Alertas de eventos importantes | 8h | Media |
| Comparador Ativos | Analise lado-a-lado | 12h | Media |
| Filosofias Pre-Config | Barsi, Bazin, Graham prontas | 8h | Media |

### Junho - Comunicacao e Retencao

| Feature | Descricao | Esforco | Prioridade |
|---------|-----------|---------|------------|
| Email Transacional | Boas-vindas, cobranca, alertas | 16h | Alta |
| Notificacoes Push | Alertas de preco/dividendos | 12h | Alta |
| Onboarding Guiado | Tour para novos usuarios | 8h | Media |
| Suporte/Tickets | Sistema de chamados basico | 16h | Media |

---

## Q3 2026 - Escala Nacional

### Julho

| Feature | Descricao | Esforco | Prioridade |
|---------|-----------|---------|------------|
| Calendario Dividendos | Visualizacao mensal B3 | 16h | Alta |
| Relatorios PDF | Exportar carteira/analise | 12h | Media |
| Integracao CEI/B3 | Importar posicoes automaticamente | 40h | Alta |

### Agosto

| Feature | Descricao | Esforco | Prioridade |
|---------|-----------|---------|------------|
| PWA (Mobile) | App instalavel via browser | 24h | Alta |
| Offline Mode | Cache de dados essenciais | 16h | Media |
| Modo Escuro | Theme toggle | 8h | Baixa |

### Setembro

| Feature | Descricao | Esforco | Prioridade |
|---------|-----------|---------|------------|
| Backtesting | Simular estrategia historica | 40h | Media |
| Valuation DCF | Fluxo de caixa descontado | 16h | Media |
| IR Helper | Auxiliar declaracao de IR | 24h | Alta |

---

## Q4 2026 - Consolidacao

| Feature | Descricao | Prioridade |
|---------|-----------|------------|
| App Nativo | React Native (iOS + Android) | Media |
| Integracao Corretoras | XP, BTG, Rico, Clear | Media |
| Chat com IA | Perguntas sobre filosofia | Baixa |
| Comunidade | Forum de usuarios | Baixa |

---

## Planos de Assinatura (Proposta)

### Estrutura de Planos

| Recurso | Free | Pro (R$29/mes) | Premium (R$59/mes) |
|---------|------|----------------|-------------------|
| Ativos monitorados | 10 | 50 | Ilimitado |
| Filosofias | 1 | 5 | Ilimitado |
| Carteiras | 1 | 3 | Ilimitado |
| Alertas | 5 | 20 | Ilimitado |
| Historico dividendos | 2 anos | 5 anos | 10 anos |
| Preco teto (Bazin/Barsi) | - | SIM | SIM |
| Ranking de ativos | - | SIM | SIM |
| Exportar PDF | - | - | SIM |
| Suporte prioritario | - | - | SIM |
| Backtesting | - | - | SIM |

### Metricas de Monetizacao

| Metrica | Target Q2 | Target Q4 |
|---------|-----------|-----------|
| Usuarios Free | 1.000 | 5.000 |
| Usuarios Pro | 50 | 300 |
| Usuarios Premium | 10 | 100 |
| MRR | R$ 2.000 | R$ 15.000 |
| Churn mensal | < 5% | < 3% |
| LTV medio | R$ 300 | R$ 500 |

---

## Painel SuperAdmin - Detalhamento

### Dashboard Principal

```
┌─────────────────────────────────────────────────────────────┐
│  INVESTIA ADMIN                                    [Admin]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │ USUARIOS│  │   MRR   │  │  CHURN  │  │ ATIVOS  │        │
│  │  1.234  │  │ R$5.2k  │  │  2.3%   │  │   523   │        │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │
│                                                             │
│  [Grafico de crescimento de usuarios - ultimos 30 dias]    │
│                                                             │
│  [Grafico de receita - MRR por mes]                        │
│                                                             │
│  ATIVIDADE RECENTE                                         │
│  ├── Usuario X fez upgrade para Pro                        │
│  ├── Usuario Y cancelou assinatura                         │
│  └── 15 novos cadastros hoje                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Modulos do Admin

| Modulo | Funcionalidades |
|--------|-----------------|
| **Dashboard** | KPIs, graficos, atividade recente |
| **Usuarios** | Lista, busca, filtro por plano, editar, suspender, deletar |
| **Assinaturas** | Lista, status, cancelar, estender trial, reembolsar |
| **Financeiro** | MRR, ARR, churn, LTV, conversao, graficos |
| **Filosofias** | Listar todas, aprovar/reprovar, destacar |
| **Ativos** | Sincronizacao, erros, forcar atualizacao |
| **Logs** | Auditoria de acoes, erros do sistema |
| **Config** | Limites de planos, modo manutencao, anuncios |

### Permissoes de Admin

| Role | Permissoes |
|------|------------|
| **SuperAdmin** | Tudo, incluindo deletar dados e config sistema |
| **Admin** | Usuarios, assinaturas, filosofias (sem config sistema) |
| **Suporte** | Visualizar usuarios, responder tickets |

---

## Metricas de Sucesso

### Q1 2026 (MVP)

| Metrica | Target | Atual | Status |
|---------|--------|-------|--------|
| Modulos Backend | 8 | 9 | Excedido |
| Endpoints API | 25 | ~30 | Excedido |
| Paginas Frontend | 8 | 10 | Excedido |
| Testes E2E | 12 | 12 | OK |
| Cobertura Testes | 60% | 40% | Abaixo |

### Q2 2026 (Monetizacao)

| Metrica | Target |
|---------|--------|
| Usuarios cadastrados | 1.000 |
| Usuarios pagantes | 60 |
| MRR | R$ 2.000 |
| Conversao Free->Pago | 6% |
| Painel Admin funcional | 100% |

### Q3-Q4 2026 (Escala)

| Metrica | Target |
|---------|--------|
| Usuarios totais | 5.000 |
| MRR | R$ 15.000 |
| NPS | > 50 |
| Churn | < 3% |

---

## Diferenciais Competitivos (Brasil)

### Versus Concorrentes Nacionais

| Aspecto | InvestIA | Status Invest | Investidor10 | TradeMap |
|---------|----------|---------------|--------------|----------|
| Screener | SIM | SIM | SIM | SIM |
| Filosofia custom | **SIM** | NAO | NAO | NAO |
| IA extracao | **SIM** | NAO | NAO | NAO |
| Preco teto auto | **SIM** | SIM | SIM | NAO |
| Ranking custom | **SIM** | NAO | NAO | NAO |
| Upload PDF | **SIM** | NAO | NAO | NAO |
| Preco | Freemium | R$39/mes | R$29/mes | Freemium |

### Foco no Investidor Brasileiro

1. **Metodos Locais**
   - Luiz Barsi (setores BESST)
   - Decio Bazin (DY 6%, rebalanceamento)
   - Graham adaptado para B3

2. **Integracao B3/CEI**
   - Importar posicoes automaticamente
   - Calcular IR sobre vendas

3. **Calendario Brasileiro**
   - Datas de dividendos B3
   - Agenda de resultados

---

## Riscos e Mitigacoes

| Risco | Probabilidade | Impacto | Mitigacao |
|-------|---------------|---------|-----------|
| API Brapi indisponivel | Media | Alto | Cache + fallback (Yahoo Finance) |
| Stripe nao aprovado | Baixa | Alto | Alternativa: Pagar.me, PagSeguro |
| Custos LLM altos | Media | Medio | Cache de regras + fallback regex |
| Regulacao CVM | Baixa | Alto | Disclaimer claro, nao dar recomendacao |
| Churn alto | Media | Alto | Onboarding guiado, email retencao |

---

## Stack Tecnica

### Backend
- NestJS + Prisma + PostgreSQL
- Redis (cache + filas)
- BullMQ (jobs)
- Stripe (pagamentos)

### Frontend
- Next.js 15 + React
- Tailwind CSS + shadcn/ui
- Recharts (graficos)

### Infra
- Docker + Docker Compose
- GitHub Actions (CI/CD)
- VPS ou Railway (deploy)

---

## Documentos Relacionados

- [Analise Competitiva BR](../docs/competitive-analysis.md)
- [Analise Internacional](../docs/international_market_analysis_opus.md)
- [Arquitetura](../docs/architecture.md)
- [Regras de Negocio](../docs/business-rules.md)
- [Sprint Atual](./sprint-atual.md)
- [Backlog Detalhado](./backlog.md)

---

**Documento mantido por:** Time InvestIA
**Proxima revisao:** Fim de Abril 2026
