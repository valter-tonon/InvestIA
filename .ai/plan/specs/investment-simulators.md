# 🧮 Feature Spec: Simuladores de Investimento

**Status**: Planned
**Prioridade**: Alta (Growth/SEO)
**Responsável**: Frontend Developer

---

## 🎯 Objetivo
Criar uma suíte de calculadoras de investimento (simuladores) para atrair novos usuários via SEO e oferecer utilidade imediata. Essas ferramentas devem ser **públicas** (acessíveis sem login) e visualmente ricas.

## 📱 Funcionalidades
Baseado em benchmarks (Mobills, Investidor Sardinha), implementaremos:

### 1. Calculadora de Juros Compostos
- **Input**: Valor inicial, aporte mensal, taxa de juros (anual/mensal), período (anos/meses).
- **Output**: Total investido, total de juros, montante final.
- **Visual**: Gráfico de linha (Crescimento patrimonial x Total investido).

### 2. Simulador de Renda Fixa
- **Tipos**: CDB, LCI, LCA, Tesouro (Selic/IPCA/Prefixado).
- **Input**: Valor, prazo, taxa contratada (% do CDI ou Taxa Fixa).
- **Lógica**: Desconto de Imposto de Renda (tabela regressiva) exceto para LCI/LCA.
- **Output**: Comparativo Poupança x Investimento escolhido.

### 3. Calculadora de Independência Financeira (Viver de Renda)
- **Input**: Custo de vida mensal desejado, patrimônio atual, capacidade de aporte.
- **Output**: Número mágico (Patrimônio necessário) e tempo estimado para chegar lá (regra dos 4% ou ajustável).

## 🎨 Requisitos de UX/UI
- **Acesso**: Público (Rotas `/ferramentas/calculadora-juros-compostos`, etc.).
- **Design**: Premium, dark mode, responsivo.
- **Interatividade**: Resultados atualizam em tempo real (com debounce).
- **Call to Action (CTA)**: Ao final da simulação, convidar o usuário para criar conta no InvestIA para "gerenciar seus investimentos reais".

## 🛠️ Stack Recomendada
- **Framework**: Next.js (App Router)
- **Libs**: Recharts (gráficos), Hook Form (formulários).
- **SEO**: Meta tags otimizadas, Schema.org markup.
