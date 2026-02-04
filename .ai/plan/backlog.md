# Backlog - InvestIA

**Ultima Atualizacao:** 03/02/2026
**Versao:** 2.0

---

## Prioridade CRITICA (MVP Comercializavel)

> Estas features sao essenciais para competir no mercado de Value Investing.
> Baseado na [Analise Competitiva](../docs/competitive-analysis.md).

### Historico de Dividendos
- **ID:** FEAT-001
- **Esforco:** 8h
- **Justificativa:** Core do value investing - Barsi/Bazin dependem disso
- **Entregaveis:**
  - [ ] Endpoint: `GET /assets/:id/dividends`
  - [ ] Integracao com fonte de dados (Brapi ou scraping)
  - [ ] Armazenamento em banco (cache)
  - [ ] Frontend: Grafico de dividendos (10 anos)
  - [ ] Frontend: Tabela com historico detalhado

### Preco Teto (Metodos Bazin/Barsi/Graham)
- **ID:** FEAT-002
- **Esforco:** 12h
- **Justificativa:** Metodo Bazin exige DY minimo 6% para compra
- **Entregaveis:**
  - [ ] Calculo Bazin: `Ultimo DY / 0.06`
  - [ ] Calculo Barsi: `Media DY 5 anos / 0.06`
  - [ ] Calculo Graham: `sqrt(22.5 * LPA * VPA)`
  - [ ] Endpoint: `GET /assets/:id/fair-price`
  - [ ] Frontend: Badge "Abaixo/Acima do Preco Teto"
  - [ ] Frontend: Card com precos calculados

### Yield on Cost
- **ID:** FEAT-003
- **Esforco:** 4h
- **Justificativa:** Metrica essencial para holders de longo prazo
- **Entregaveis:**
  - [ ] Formula: `Dividendo Anual / Preco Medio de Compra`
  - [ ] Requer: Preco medio na carteira do usuario
  - [ ] Frontend: Coluna na tela de carteira
  - [ ] Frontend: Grafico de evolucao YoC

---

## Prioridade Alta (Sprint Marco)

### Ranking de Ativos por Estrategia
- **ID:** FEAT-004
- **Esforco:** 16h
- **Justificativa:** Diferencial unico - nenhum concorrente oferece
- **Entregaveis:**
  - [ ] Endpoint: `GET /assets/ranking?strategyId=xxx`
  - [ ] Aplicar regras da filosofia no screener
  - [ ] Score de 0-100 para cada ativo
  - [ ] Frontend: Tela de ranking com filtros
  - [ ] Frontend: Ordenacao por score

### Multiplas Carteiras
- **ID:** FEAT-005
- **Esforco:** 12h
- **Justificativa:** Padrao de mercado - todos concorrentes tem
- **Entregaveis:**
  - [ ] CRUD de Wallets (ja existe no schema)
  - [ ] Associacao de ativos a carteiras
  - [ ] Dashboard por carteira
  - [ ] Frontend: Seletor de carteira
  - [ ] Frontend: CRUD de carteiras

### Notificacao de Rebalanceamento
- **ID:** FEAT-006
- **Esforco:** 8h
- **Justificativa:** Metodo Bazin exige rebalanceamento semestral
- **Entregaveis:**
  - [ ] Job para verificar periodos (Abril/Outubro)
  - [ ] Listar acoes abaixo de DY 6%
  - [ ] Sugerir vendas e novas compras
  - [ ] Endpoint: `GET /portfolios/:id/rebalance-suggestions`
  - [ ] Frontend: Tela de sugestoes de rebalanceamento

### Historico de Operacoes
- **ID:** FEAT-007
- **Esforco:** 12h
- **Justificativa:** Tracking de compras/vendas para calculo de P&L
- **Entregaveis:**
  - [ ] Modelo: Transaction (buy/sell, quantity, price, date)
  - [ ] CRUD de transacoes
  - [ ] Calculo de preco medio automatico
  - [ ] Calculo de lucro/prejuizo realizado
  - [ ] Frontend: Tela de historico

### CI/CD Pipeline
- **ID:** INFRA-001
- **Esforco:** 8h
- **Justificativa:** Automacao essencial para qualidade
- **Entregaveis:**
  - [ ] GitHub Actions workflow
  - [ ] Build automatico
  - [ ] Lint + Type check
  - [ ] Testes E2E no CI
  - [ ] Deploy staging (opcional)

---

## Prioridade Media (Q2 2026)

### Backtesting de Estrategias
- **ID:** FEAT-008
- **Esforco:** 40h
- **Justificativa:** Validar estrategia antes de investir dinheiro real
- **Entregaveis:**
  - [ ] Endpoint: `POST /strategies/:id/backtest`
  - [ ] Simular compras/vendas em periodo historico
  - [ ] Calcular retorno vs benchmark (IBOV)
  - [ ] Frontend: Configuracao de periodo
  - [ ] Frontend: Grafico comparativo

### Comparador de Ativos
- **ID:** FEAT-009
- **Esforco:** 12h
- **Justificativa:** Todos concorrentes tem - analise lado-a-lado
- **Entregaveis:**
  - [ ] Endpoint: `GET /assets/compare?tickers=PETR4,VALE3`
  - [ ] Tabela comparativa de indicadores
  - [ ] Graficos sobrepostos
  - [ ] Frontend: Selecao de ativos para comparar

### Valuation Automatico
- **ID:** FEAT-010
- **Esforco:** 24h
- **Justificativa:** Status Invest tem, diferencial importante
- **Entregaveis:**
  - [ ] Modelo DCF (Fluxo de Caixa Descontado)
  - [ ] Modelo Graham completo
  - [ ] Modelo Bazin completo
  - [ ] Endpoint: `GET /assets/:id/valuation`
  - [ ] Frontend: Card de valuation com explicacao

### Integracao B3
- **ID:** FEAT-011
- **Esforco:** 40h
- **Justificativa:** TradeMap e Gorila tem - importar automaticamente
- **Entregaveis:**
  - [ ] Autenticacao com B3 (OAuth ou scraping)
  - [ ] Importar posicoes
  - [ ] Importar historico de transacoes
  - [ ] Sincronizacao automatica

### Filosofias Pre-Configuradas
- **ID:** FEAT-012
- **Esforco:** 16h
- **Justificativa:** Onboarding mais rapido para novos usuarios
- **Entregaveis:**
  - [ ] Filosofia Barsi (setores BESST)
  - [ ] Filosofia Bazin (DY > 6%)
  - [ ] Filosofia Graham (P/L < 15, P/VP < 1.5)
  - [ ] Filosofia Lynch (PEG < 1)
  - [ ] Filosofia Buffett (moat + ROE alto)
  - [ ] Frontend: Galeria de filosofias

---

## Prioridade Baixa (Q3-Q4 2026)

### Mobile App
- **ID:** FEAT-013
- **Esforco:** 80h+
- **Justificativa:** 3M+ usuarios em apps concorrentes
- **Entregaveis:**
  - [ ] React Native (iOS + Android)
  - [ ] Autenticacao
  - [ ] Dashboard
  - [ ] Alertas push
  - [ ] Screener basico

### API Publica
- **ID:** FEAT-014
- **Esforco:** 24h
- **Justificativa:** Integracao com terceiros, potencial B2B
- **Entregaveis:**
  - [ ] Documentacao OpenAPI
  - [ ] Rate limiting por API key
  - [ ] Dashboard de uso
  - [ ] Planos de API (free/pro)

### Notificacoes Push
- **ID:** FEAT-015
- **Esforco:** 20h
- **Justificativa:** Engajamento e retencao
- **Entregaveis:**
  - [ ] Email (SendGrid/SES)
  - [ ] Telegram Bot
  - [ ] Web Push
  - [ ] Configuracao de preferencias

### Simuladores Publicos (SEO)
- **ID:** FEAT-016
- **Esforco:** 16h
- **Justificativa:** Atrair trafego organico
- **Entregaveis:**
  - [ ] Calculadora de Juros Compostos
  - [ ] Calculadora de Renda Fixa
  - [ ] Calculadora de Dividendos
  - [ ] Landing pages otimizadas

---

## Concluidos

### Sprint 1 (Janeiro 2026)
- [x] Setup Docker (PostgreSQL + Redis + NestJS)
- [x] Schema Prisma (User, Asset, Philosophy, Wallet)
- [x] Estrutura Clean Architecture
- [x] Modulo MarketData (busca cotacoes Brapi)
- [x] Modulo AnalysisEngine (motor de regras)
- [x] Modulo KnowledgeBase (ingestao de filosofias)
- [x] CRUD Users
- [x] CRUD Assets (com filtros e indicadores)
- [x] Autenticacao JWT (Access + Refresh)
- [x] Documentacao Swagger
- [x] Job BullMQ (sincronizacao diaria)
- [x] Upload de PDFs + extracao de regras
- [x] Testes E2E (12/12 passed)
- [x] Rate Limiting

### Sprint 2 (Fevereiro 2026)
- [x] Frontend - Autenticacao (Login/Registro)
- [x] Frontend - Assets (CRUD completo)
- [x] Frontend - Philosophies (Upload + visualizacao)
- [x] Extracao LLM (OpenAI + Gemini)
- [x] Dashboard com Graficos (4 endpoints + Recharts)
- [x] Repository Pattern (Users, Assets)
- [x] Soft Delete + Cascade Delete
- [x] Seguranca (CSRF, HttpOnly Cookies, Helmet)
- [x] Global Exception Filter
- [x] Testes unitarios expandidos

---

## Estatisticas do Projeto

**Ultima atualizacao:** 03/02/2026

| Metrica | Valor |
|---------|-------|
| Modulos implementados | 9 |
| Endpoints criados | ~30 |
| Testes E2E | 12/12 |
| Testes Unitarios | 28 arquivos |
| Paginas Frontend | 10 |
| Componentes UI | 20+ |
| Rate Limits configurados | 4 |
| Vulnerabilidades criticas | 0 |
| Cobertura testes | ~40% |
| Progresso MVP | 75% |

---

## Proximos Passos Imediatos

1. **Esta semana:** Finalizar CI/CD Pipeline
2. **Proxima semana:** Iniciar Historico de Dividendos
3. **Marco Semana 2:** Preco Teto + Yield on Cost
4. **Marco Semana 3:** Ranking de Ativos
5. **Marco Semana 4:** Multiplas Carteiras + Testes

---

## Referencias

- [Analise Competitiva](../docs/competitive-analysis.md)
- [Roadmap](./roadmap.md)
- [Sprint Atual](./sprint-atual.md)
- [Metodo Bazin](https://clubedovalor.com.br/blog/decio-bazin/)
- [Estrategia Barsi](https://investidor10.com.br/conteudo/luiz-barsi/)

---

**Documento mantido por:** Time InvestIA
