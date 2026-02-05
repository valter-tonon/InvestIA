# 📊 Regras de Negócio - InvestIA

## Domínio: Análise de Investimentos

O InvestIA é um SaaS que aplica **filosofias de investimento** (Warren Buffett, Décio Bazin, etc.) de forma automatizada sobre ativos do mercado brasileiro.

---

## Entidades Principais

### User
- Usuário do sistema
- Pode ter múltiplas carteiras e estratégias

### Asset (Ativo)
Representa um ativo financeiro:
- **Tipos**: STOCK (ação), REIT (FII), ETF, BDR
- **Indicadores**: DY, P/L, P/VP, ROE, Margem Líquida, Dívida/PL

### StrategyProfile (Estratégia)
Conjunto de regras de investimento:
- Armazenado como JSON dinâmico
- Pode ser criado via upload de PDF ou manual

### Wallet (Carteira)
Agrupa ativos do usuário:
- Quantidade, preço médio
- Cálculo de performance

---

## Regras de Negócio

### RN-001: Formato de Regras (Schema)
Regras extraídas via IA seguem um schema estrito (ver [rules_engine.md](./rules_engine.md) para detalhes completos):
```json
{
  "category": "valuation",
  "indicator": "P/L",
  "operator": "<",
  "value": 10,
  "unit": "x",
  "confidence": 0.95
}
```
**Categorias**: `valuation`, `profitability`, `debt`, `dividend`, `growth`, `quality`, `check`.

### RN-001.1: Setores Padronizados (B3)
Ativos devem pertencer a um dos setores: `Financeiro`, `Tecnologia`, `Saúde`, `Indústria`, `Consumo Cíclico`, `Consumo Não Cíclico`, `Materiais Básicos`, `Petróleo, Gás e Biocombustíveis`, `Utilidade Pública`, `Imobiliário`, `Comunicações`, `Outros`.

### RN-002: Score de Ativo
- Cada regra tem peso (weight)
- Score = Soma(pesos das regras aprovadas) / Soma(todos os pesos) × 100
- Ativo **aprovado** se score >= 70%

### RN-003: Sincronização de Cotações
- Dados são buscados da API Brapi
- Atualização mínima: 1x ao dia (pregão fechado)
- Rate limit: 200ms entre requests

### RN-004: Validação de Estratégia
- Estratégia deve ter pelo menos 1 regra
- Indicadores devem ser válidos
- Valores devem ser numéricos

---

## Fluxos Principais

### Fluxo 1: Análise de Ativo
```
1. Usuário seleciona ativo e estratégia
2. Sistema busca dados do ativo
3. Motor executa cada regra contra os dados
4. Retorna score e detalhamento
```

### Fluxo 2: Ingestão de Filosofia
```
1. Usuário faz upload de PDF/texto
2. LLM extrai regras do documento
3. Sistema valida formato das regras
4. Salva StrategyProfile no banco
```

### Fluxo 3: Filtro de Ativos
```
1. Usuário seleciona estratégia
2. Sistema aplica regras em todos os ativos
3. Retorna lista ordenada por score
```

---

## Glossário

| Termo | Definição |
|-------|-----------|
| DY | Dividend Yield - Dividendos / Preço |
| P/L | Preço / Lucro por ação |
| P/VP | Preço / Valor Patrimonial |
| ROE | Return on Equity |
| FII | Fundo de Investimento Imobiliário |
