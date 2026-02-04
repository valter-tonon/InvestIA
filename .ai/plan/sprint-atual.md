# Sprint Atual

**Sprint**: 2 (final) + 3 (inicio)
**Periodo**: Fev-Mar/2026
**Foco**: MVP Comercializavel + Features Value Investing

---

## Sprint 1 - Janeiro - CONCLUIDA

Todas as tarefas foram concluidas com sucesso:

- [x] CRUD Users (endpoints basicos)
- [x] CRUD Assets (cadastro de ativos)
- [x] Autenticacao JWT (Access + Refresh Tokens)
- [x] Documentacao Swagger (UI interativa)
- [x] Job de Sincronizacao Automatica (BullMQ)
- [x] Upload de Filosofias (PDF + extracao de regras)
- [x] Testes E2E (12/12 passed)
- [x] Rate Limiting (protecao contra abuso)

---

## Sprint 2 - Fevereiro - EM FINALIZACAO

### Concluidos

- [x] **Integracao Frontend com API de Autenticacao**
  - Telas de Login e Registro funcionais
  - AuthProvider com Context API
  - Protecao de rotas
  - HttpOnly Cookies (seguranca)

- [x] **Paginas de Assets no Frontend**
  - Listagem com filtros e busca
  - Criacao, visualizacao e remocao
  - Componentes: AssetList, AssetCard, IndicatorBadge

- [x] **Paginas de Philosophies no Frontend**
  - Upload de PDF com drag & drop
  - Visualizacao de regras extraidas pela IA
  - Componentes: FileUpload, PhilosophyCard

- [x] **Dashboard com Graficos**
  - 4 endpoints REST (summary, performance, sectors, top-assets)
  - 3 graficos Recharts (Line, Pie, Bar)
  - Selecao de periodo (7d, 30d, 90d, 1y)

- [x] **Refatoracao e Seguranca**
  - Repository Pattern (Users, Assets, Auth)
  - Soft Delete e Cascade Delete
  - CSRF, HttpOnly Cookies, Helmet
  - Global Exception Filter

- [x] **Extracao LLM**
  - OpenAI (GPT-4o-mini) e Gemini (gemini-1.5-flash)
  - Fallback automatico para regex
  - Regras estruturadas em JSON

### Pendentes (Finalizar esta semana)

| Task | Prioridade | Status | Responsavel |
|------|------------|--------|-------------|
| CI/CD Pipeline | Alta | Em progresso | - |
| Frontend Alertas (finalizar) | Media | 80% | - |

---

## Sprint 3 - Marco - MVP COMERCIALIZAVEL

### Objetivo
Entregar um produto comercializavel focado em **Value Investing** com diferenciais competitivos unicos.

### Contexto
Baseado na [Analise Competitiva](../docs/competitive-analysis.md), identificamos que:
1. Nenhum concorrente oferece upload de filosofias + IA
2. Investidores Barsi/Bazin nao tem ferramenta completa
3. Faltam features essenciais: historico dividendos, preco teto

### Semana 1 (03-09 Mar) - Dividendos

| Task | Esforco | Prioridade |
|------|---------|------------|
| Backend: Endpoint historico dividendos | 4h | CRITICA |
| Backend: Integracao fonte dados (Brapi) | 4h | CRITICA |
| Frontend: Grafico dividendos 10 anos | 4h | CRITICA |
| Frontend: Tabela historico detalhado | 2h | CRITICA |
| CI/CD: Finalizar pipeline | 4h | Alta |

**Entregavel:** Tela de ativo mostrando historico completo de dividendos.

### Semana 2 (10-16 Mar) - Preco Teto

| Task | Esforco | Prioridade |
|------|---------|------------|
| Backend: Calculo preco teto Bazin | 2h | CRITICA |
| Backend: Calculo preco teto Barsi | 2h | CRITICA |
| Backend: Calculo preco justo Graham | 2h | CRITICA |
| Backend: Endpoint fair-price | 2h | CRITICA |
| Frontend: Badge abaixo/acima preco | 2h | CRITICA |
| Frontend: Card precos calculados | 4h | CRITICA |
| Backend: Yield on Cost | 2h | Alta |
| Frontend: Coluna YoC na carteira | 2h | Alta |

**Entregavel:** Card de "Preco Justo" em cada ativo com 3 metodologias.

### Semana 3 (17-23 Mar) - Ranking

| Task | Esforco | Prioridade |
|------|---------|------------|
| Backend: Endpoint ranking por estrategia | 8h | Alta |
| Backend: Aplicar regras no screener | 4h | Alta |
| Backend: Score 0-100 por ativo | 2h | Alta |
| Frontend: Tela de ranking | 6h | Alta |
| Frontend: Filtros e ordenacao | 2h | Alta |

**Entregavel:** Tela de ranking mostrando ativos ordenados por aderencia a filosofia.

### Semana 4 (24-31 Mar) - Carteiras + Polish

| Task | Esforco | Prioridade |
|------|---------|------------|
| Backend: CRUD Wallets | 4h | Alta |
| Backend: Associar ativos a carteiras | 4h | Alta |
| Frontend: Seletor de carteira | 2h | Alta |
| Frontend: CRUD de carteiras | 4h | Alta |
| Backend: Job rebalanceamento | 4h | Media |
| Backend: Sugestoes rebalanceamento | 4h | Media |
| Testes E2E novas features | 8h | Alta |
| Bug fixes e polish | 8h | Alta |

**Entregavel:** Sistema de multiplas carteiras + sugestoes de rebalanceamento.

---

## Criterios de Aceite MVP

### Funcionalidades Obrigatorias
- [ ] Usuario pode ver historico de dividendos de qualquer ativo
- [ ] Usuario pode ver preco teto (Bazin/Barsi/Graham) de qualquer ativo
- [ ] Usuario pode ver ranking de ativos por sua filosofia
- [ ] Usuario pode criar multiplas carteiras
- [ ] Usuario recebe sugestao de rebalanceamento

### Qualidade
- [ ] Zero vulnerabilidades criticas
- [ ] Cobertura de testes > 50%
- [ ] CI/CD funcionando
- [ ] Documentacao atualizada

### Performance
- [ ] Tempo de resposta < 500ms (p95)
- [ ] Dashboard carrega em < 2s
- [ ] Screener com 500+ ativos funciona

---

## Metricas Sprint 3

| Metrica | Target |
|---------|--------|
| Features entregues | 6/6 |
| Bugs criticos | 0 |
| Cobertura testes | > 50% |
| Usuarios beta | 10 |
| Feedback NPS | > 30 |

---

## Bloqueados

*Nenhum no momento*

---

## Riscos

| Risco | Probabilidade | Mitigacao |
|-------|---------------|-----------|
| API Brapi sem historico dividendos | Media | Fallback: scraping Status Invest |
| Escopo muito grande | Media | Priorizar features CRITICAS |
| Bugs em producao | Baixa | CI/CD + testes E2E |

---

## Notas Tecnicas

- **API Backend:** http://localhost:3001
- **Frontend:** http://localhost:3000
- **Swagger:** http://localhost:3001/api
- **Testes:** `npm run test:e2e`

### Novos Endpoints Sprint 3

```
GET  /assets/:id/dividends      # Historico de dividendos
GET  /assets/:id/fair-price     # Preco teto (Bazin/Barsi/Graham)
GET  /assets/ranking            # Ranking por estrategia
GET  /wallets                   # Listar carteiras
POST /wallets                   # Criar carteira
GET  /wallets/:id/rebalance     # Sugestoes rebalanceamento
```

---

## Retrospectiva Sprint 2

### O que funcionou bem
- Clean Architecture facilitou adicao de features
- HttpOnly Cookies + CSRF melhoraram seguranca
- Dashboard com graficos ficou profissional
- Extracao LLM funciona bem

### O que melhorar
- Faltou CI/CD (ainda manual)
- Cobertura de testes ainda baixa (40%)
- Documentacao de API incompleta

### Acoes para Sprint 3
- Priorizar CI/CD na primeira semana
- Adicionar testes para cada feature nova
- Atualizar Swagger com novos endpoints

---

## Links Uteis

- [Roadmap](./roadmap.md)
- [Backlog](./backlog.md)
- [Analise Competitiva](../docs/competitive-analysis.md)
- [Auditoria de Codigo](../docs/code-audit-report.md)
- [Metodo Bazin](https://clubedovalor.com.br/blog/decio-bazin/)
- [Estrategia Barsi](https://investidor10.com.br/conteudo/luiz-barsi/)

---

**Ultima atualizacao:** 03/02/2026
