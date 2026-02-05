# Analise Competitiva - InvestIA

**Data:** 03/02/2026
**Versao:** 1.0
**Autor:** Claude Code (Opus 4.5)

---

## Sumario Executivo

Este documento apresenta uma analise competitiva do InvestIA comparado aos principais players do mercado brasileiro de plataformas de analise de investimentos. O objetivo e identificar gaps, oportunidades e direcionar o roadmap do produto.

### Principais Conclusoes

1. **Diferencial unico confirmado:** Nenhum concorrente oferece upload de filosofias + extracao de regras por IA
2. **Nicho subatendido:** Investidores value investing (Barsi/Bazin) nao tem ferramenta completa
3. **Gaps criticos:** Historico de dividendos, preco teto, backtesting
4. **Potencial:** Com ajustes, InvestIA pode ser lider no nicho value investing

---

## 1. Mapeamento de Concorrentes

### 1.1 Tier 1 - Plataformas Completas

#### Status Invest
- **URL:** https://statusinvest.com.br
- **Foco:** Analise fundamentalista avancada
- **Preco:** R$ 39,90/mes (premium)
- **Publico:** Investidores experientes
- **Pontos Fortes:**
  - 30+ indicadores fundamentalistas
  - Screener avancado com multiplos filtros
  - Calculadora de valuation (Graham, DCF)
  - Cobertura de acoes, FIIs, Tesouro Direto
- **Pontos Fracos:**
  - Interface densa, pode assustar iniciantes
  - Sem personalizacao de estrategias
  - Sem integracao com B3

#### Investidor10
- **URL:** https://investidor10.com.br
- **Foco:** Analise simplificada para todos
- **Preco:** R$ 29,90/mes (premium)
- **Publico:** Iniciantes e intermediarios
- **Pontos Fortes:**
  - Interface limpa e intuitiva
  - Preco Justo (metodos Graham e Bazin)
  - Carteiras recomendadas
  - Comparador de empresas
- **Pontos Fracos:**
  - Menos indicadores que Status Invest
  - Sem ferramentas de analise tecnica
  - Personalizacao limitada

#### TradeMap
- **URL:** https://trademap.com.br
- **Foco:** Multibroker + informacoes em tempo real
- **Preco:** Premium variavel
- **Publico:** Traders e investidores ativos
- **Pontos Fortes:**
  - Primeiro multibroker do Brasil (3M+ usuarios)
  - Integracao com corretoras (XP, BTG, etc.)
  - Noticias em tempo real (Reuters, Estadao)
  - Cotacoes em tempo real
- **Pontos Fracos:**
  - Foco em trading, menos em value investing
  - Muitas funcoes requerem premium
  - Pode ser complexo para iniciantes

#### Gorila
- **URL:** https://gorila.com.br
- **Foco:** Consolidacao de carteiras
- **Preco:** Freemium
- **Publico:** Investidores com multiplas contas
- **Pontos Fortes:**
  - Integracao direta com B3
  - Multiplos portfolios
  - Relatorios PDF profissionais
  - API para integracao
- **Pontos Fracos:**
  - Sem screener de ativos
  - Sem recomendacoes
  - Foco em consolidacao, nao analise

---

### 1.2 Tier 2 - Screeners e Ferramentas

#### Fundamentus
- **URL:** https://www.fundamentus.com.br
- **Foco:** Screener gratuito
- **Preco:** Gratuito
- **Pontos Fortes:**
  - Totalmente gratuito
  - Screener por indicadores
  - Download em Excel
  - Dados desde 1998
- **Pontos Fracos:**
  - Interface antiga
  - Sem graficos
  - Sem gestao de carteira

#### Fundamentei
- **URL:** https://fundamentei.com
- **Foco:** Dados historicos
- **Preco:** Freemium
- **Pontos Fortes:**
  - 10+ anos de dados historicos
  - 300+ ativos BR, 5500+ stocks EUA
  - Dezenas de indicadores
- **Pontos Fracos:**
  - Sem ferramentas de gestao
  - Interface basica

#### TradingView
- **URL:** https://br.tradingview.com/screener
- **Foco:** Analise tecnica + screener
- **Preco:** Freemium
- **Pontos Fortes:**
  - Graficos avancados
  - Screener global
  - Comunidade ativa
  - Suporta ETFs e crypto
- **Pontos Fracos:**
  - Foco em analise tecnica
  - Menos dados fundamentalistas BR
  - Premium caro para recursos completos

---

### 1.3 Tier 3 - Robo Advisors

| Plataforma | Foco | Modelo |
|------------|------|--------|
| Magnetis | Carteiras automatizadas | Fundos/ETFs |
| Warren | Perfis de risco | Fundos proprios |
| Verios | ETFs | Index investing |

**Nota:** Robo advisors focam em fundos, nao em stock picking individual.

---

## 2. Matriz Comparativa de Funcionalidades

### 2.1 Funcionalidades Core

| Funcionalidade | Status Invest | Investidor10 | TradeMap | Gorila | Fundamentus | **InvestIA** |
|----------------|---------------|--------------|----------|--------|-------------|--------------|
| Screener indicadores | SIM | SIM | SIM | NAO | SIM | SIM |
| Consolidacao carteira | SIM | SIM | SIM | SIM | NAO | MARCO |
| Alertas de preco | SIM | SIM | SIM | SIM | NAO | SIM |
| Graficos performance | SIM | SIM | SIM | SIM | NAO | SIM |
| Historico dividendos | SIM | SIM | SIM | SIM | SIM | **FALTA** |
| Preco teto/justo | SIM | SIM | NAO | NAO | NAO | **FALTA** |
| Valuation automatico | SIM | SIM | NAO | NAO | NAO | **FALTA** |
| Integracao B3 | NAO | NAO | SIM | SIM | NAO | Q2 |
| App mobile | SIM | SIM | SIM | SIM | NAO | Q3 |

### 2.2 Diferenciais Exclusivos

| Funcionalidade | Status Invest | Investidor10 | TradeMap | Gorila | **InvestIA** |
|----------------|---------------|--------------|----------|--------|--------------|
| Upload filosofia propria | NAO | NAO | NAO | NAO | **SIM** |
| Extracao regras por IA | NAO | NAO | NAO | NAO | **SIM** |
| Estrategias personalizadas | NAO | Limitado | NAO | NAO | **SIM** |
| Ranking por estrategia | NAO | NAO | NAO | NAO | **MARCO** |
| Motor de regras dinamico | NAO | NAO | NAO | NAO | **SIM** |

---

## 3. Analise de Nicho: Value Investing Brasil

### 3.1 Metodologias Populares

#### Metodo Luiz Barsi
- **Filosofia:** Foco em dividendos de setores estaveis
- **Setores BESST:** Bancos, Energia, Saneamento, Seguros, Telefonia
- **Criterios:**
  - Empresas com historico consistente de dividendos
  - Setores com receita previsivel
  - Gestao conservadora
  - Preco teto baseado em media de dividendos (5-6 anos)

#### Metodo Decio Bazin
- **Filosofia:** Acao = renda fixa com potencial de valorizacao
- **Criterios Quantitativos:**
  - Dividend Yield minimo: 6% a.a.
  - Endividamento moderado
  - Rebalanceamento semestral (Abril/Outubro)
- **Preco Teto:** Ultimo dividendo / 0.06

#### Metodo Benjamin Graham
- **Filosofia:** Margem de seguranca + valor intrinseco
- **Criterios:**
  - P/L < 15
  - P/VP < 1.5
  - P/L x P/VP < 22.5
  - Divida < Patrimonio Liquido
  - Lucros positivos nos ultimos 10 anos
- **Formula Graham:** VI = sqrt(22.5 x LPA x VPA)

### 3.2 Gap de Mercado Identificado

**Problema:** Investidores que seguem Barsi/Bazin/Graham precisam:
1. Calcular manualmente preco teto
2. Acompanhar dividendos em planilhas
3. Lembrar de rebalancear (Abril/Outubro)
4. Aplicar filtros manualmente

**Oportunidade InvestIA:**
- Automatizar calculos de preco teto
- Alertar quando acao atinge preco de compra
- Notificar periodos de rebalanceamento
- Aplicar filosofia automaticamente via IA

---

## 4. Gaps Criticos do InvestIA

### 4.1 Gaps para MVP Comercial

| Gap | Impacto | Motivo | Esforco | Prioridade |
|-----|---------|--------|---------|------------|
| Historico Dividendos | CRITICO | Core do value investing | 8h | **MARCO** |
| Calculo Preco Teto | CRITICO | Metodo Bazin/Barsi exige | 4h | **MARCO** |
| Yield on Cost | ALTO | Metrica essencial para holders | 4h | **MARCO** |
| Rebalanceamento | ALTO | Bazin: semestral obrigatorio | 8h | **MARCO** |

### 4.2 Gaps para Competir com Tier 1

| Gap | Impacto | Esforco | Prioridade |
|-----|---------|---------|------------|
| Backtesting | ALTO | 40h | Q2 |
| Valuation (DCF/Graham) | MEDIO | 16h | Q2 |
| Comparador lado-a-lado | MEDIO | 12h | Q2 |
| Integracao B3 | ALTO | 40h | Q2 |
| App Mobile | ALTO | 80h+ | Q3 |

### 4.3 Gaps Opcionais (Nice to Have)

| Gap | Impacto | Esforco | Prioridade |
|-----|---------|---------|------------|
| Noticias/Feed | BAIXO | 24h | Baixa |
| Analise Tecnica | BAIXO | 40h | Baixa |
| Social/Comunidade | BAIXO | 60h | Baixa |

---

## 5. Oportunidades Estrategicas

### 5.1 Posicionamento Recomendado

**Tagline:** "A plataforma de Value Investing com Inteligencia Artificial"

**Proposta de Valor:**
> "Transforme qualquer filosofia de investimento em uma estrategia automatizada.
> Upload seu livro favorito, deixe a IA extrair as regras, e receba alertas
> quando encontrar acoes que se encaixam no seu perfil."

### 5.2 Nichos de Mercado

#### Nicho 1: Seguidores de Barsi/Bazin (Principal)
- **Tamanho estimado:** 500k+ investidores BR
- **Dor:** Fazer calculos manualmente
- **Solucao:** Automatizar metodo completo
- **Diferencial:** Unica plataforma que faz isso

#### Nicho 2: Leitores de Livros de Investimento
- **Tamanho estimado:** 1M+ pessoas/ano compram livros
- **Dor:** Ler Graham/Buffett mas nao saber aplicar
- **Solucao:** Upload do livro, IA extrai regras
- **Diferencial:** Ninguem oferece isso

#### Nicho 3: Assessores de Investimento (B2B)
- **Tamanho estimado:** 20k+ assessores no Brasil
- **Dor:** Justificar recomendacoes com metodologia
- **Solucao:** White-label com regras documentadas
- **Diferencial:** Auditoria de decisoes

### 5.3 Modelo de Monetizacao Sugerido

| Plano | Preco | Funcionalidades |
|-------|-------|-----------------|
| **Free** | R$ 0 | Screener basico, 1 filosofia, alertas limitados |
| **Pro** | R$ 29,90/mes | Filosofias ilimitadas, IA, alertas ilimitados |
| **Premium** | R$ 59,90/mes | Backtesting, multiplas carteiras, API |
| **Enterprise** | Sob consulta | White-label, integracao, suporte dedicado |

---

## 6. Recomendacoes para Roadmap

### 6.1 Adicoes Urgentes (Marco 2026)

```
PRIORIDADE MAXIMA - Adicionar ao Sprint de Marco:

1. Historico de Dividendos
   - Endpoint: GET /assets/:id/dividends
   - Frontend: Grafico + tabela de dividendos
   - Dados: Ultimos 10 anos (via Brapi ou scraping)

2. Calculo Preco Teto
   - Metodo Bazin: Ultimo DY / 0.06
   - Metodo Barsi: Media DY 5 anos / 0.06
   - Metodo Graham: sqrt(22.5 * LPA * VPA)
   - Frontend: Badge "Abaixo/Acima do Preco Teto"

3. Yield on Cost
   - Formula: Dividendo Anual / Preco Medio Compra
   - Requer: Preco medio na carteira
   - Frontend: Coluna na carteira

4. Notificacao Rebalanceamento
   - Alertar em Abril e Outubro (Metodo Bazin)
   - Listar acoes que cairam abaixo de DY 6%
   - Sugerir vendas e novas compras
```

### 6.2 Roadmap Revisado Q1-Q2 2026

#### Marco 2026 (MVP Comercializavel)

| Semana | Entrega |
|--------|---------|
| 1 | Historico Dividendos (backend + frontend) |
| 2 | Preco Teto + Yield on Cost |
| 3 | Ranking de Ativos por Estrategia |
| 4 | Multiplas Carteiras + Rebalanceamento |

#### Abril 2026

| Semana | Entrega |
|--------|---------|
| 1-2 | Backtesting de Estrategias |
| 3-4 | Comparador de Ativos |

#### Maio 2026

| Semana | Entrega |
|--------|---------|
| 1-2 | Valuation Automatico (Graham + DCF) |
| 3-4 | Integracao B3 (importar notas) |

#### Junho 2026

| Semana | Entrega |
|--------|---------|
| 1-2 | API Publica + Webhooks |
| 3-4 | Inicio Mobile App |

### 6.3 Metricas de Sucesso por Fase

| Fase | Metrica | Target |
|------|---------|--------|
| MVP (Marco) | Usuarios beta | 50 |
| Q2 | Usuarios ativos | 500 |
| Q2 | Conversao Free->Pro | 5% |
| Q3 | MRR | R$ 10k |
| Q4 | Usuarios totais | 5.000 |

---

## 7. Analise SWOT

### Forcas (Strengths)
- Diferencial unico: IA + Filosofias personalizadas
- Arquitetura moderna e escalavel
- Time tecnico capaz (Clean Architecture, testes)
- Nicho claro e subatendido

### Fraquezas (Weaknesses)
- Produto ainda em desenvolvimento
- Sem base de usuarios
- Sem historico de mercado
- Dependencia de APIs externas (Brapi)

### Oportunidades (Opportunities)
- Mercado de investidores PF em crescimento
- Educacao financeira em alta
- Nenhum concorrente foca em IA + filosofias
- Potencial B2B com assessores

### Ameacas (Threats)
- Concorrentes estabelecidos podem copiar
- Regulacao de robo advisors
- Dependencia de provedores de dados
- Mudancas em APIs de mercado

---

## 8. Conclusao

O InvestIA possui um **diferencial competitivo real e defensavel**: a combinacao de upload de filosofias com extracao de regras por IA nao existe em nenhum concorrente.

Para transformar isso em produto comercializavel ate Marco 2026, e **essencial** adicionar:
1. Historico de dividendos
2. Calculo de preco teto (Bazin/Barsi/Graham)
3. Yield on Cost
4. Notificacoes de rebalanceamento

Com essas adicoes, o InvestIA estara **80% competitivo** com Status Invest e Investidor10, mas com um diferencial que eles nao podem replicar facilmente.

**Recomendacao Final:** Priorizar features de value investing em Marco, deixar integracao B3 e mobile para Q2/Q3.

---

## Referencias

- [Fundamentus - Stock Screener](https://www.fundamentus.com.br/)
- [TradingView Screener Brasil](https://br.tradingview.com/screener/)
- [Comparativo Status Invest vs Investidor10](https://passosparainvestir.com.br/investidor10-ou-statusinvest/)
- [Metodo Decio Bazin - Clube do Valor](https://clubedovalor.com.br/blog/decio-bazin/)
- [Estrategia Luiz Barsi - Investidor10](https://investidor10.com.br/conteudo/luiz-barsi-o-maior-investidor-individual-do-brasil-110500/)
- [Investing.com Stock Screener](https://br.investing.com/stock-screener)
- [Calculadora do Investidor - Selecao Acoes](https://www.calculadoradoinvestidor.com.br/selecao-acoes)

---

**Documento gerado por Claude Code (Opus 4.5)**
**Proxima revisao:** Apos conclusao do MVP (Marco 2026)
