# 🚨 PROTEÇÃO DO BANCO DE DADOS EM TESTES

## Problema Identificado

Os testes E2E estavam usando o **banco de dados principal** e executando `deleteMany()` em todas as tabelas a cada teste! Isso poderia causar **perda de dados em produção**.

## Solução Implementada

### 1. Banco de Dados Separado para Testes

Criado `DATABASE_URL_TEST` no `.env.example`:

```env
# Database principal (PROTEGIDO)
DATABASE_URL=postgresql://sardinha:sardinha123@db:5432/investia_db?schema=public

# Database de TESTES (usado pelos testes E2E)
DATABASE_URL_TEST=postgresql://sardinha:sardinha123@db:5432/investia_test_db?schema=public
```

### 2. Setup Automático para E2E

Criado `test/setup-e2e.ts` que:
- ✅ Define `NODE_ENV=test` automaticamente
- ✅ Sobrescreve `DATABASE_URL` para usar `DATABASE_URL_TEST`
- ✅ Exibe logs claros mostrando qual banco está sendo usado
- ✅ Protege o banco principal de ser modificado

### 3. Configuração do Jest

Atualizado `test/jest-e2e.json` para carregar o setup automaticamente:

```json
{
  "setupFilesAfterEnv": ["<rootDir>/setup-e2e.ts"]
}
```

## Como Usar

### Criar o Banco de Teste

```bash
# Dentro do container do banco de dados
docker compose exec db psql -U sardinha -c "CREATE DATABASE investia_test_db;"

# Rodar migrations no banco de teste
docker compose exec app npx prisma migrate deploy
```

### Rodar Testes E2E com Segurança

```bash
# Agora os testes usam automaticamente o banco de teste
docker compose exec app npm run test:e2e

# Você verá logs confirmando:
# 🧪 E2E Test Setup:
#    NODE_ENV: test
#    Using TEST database: postgresql://...investia_test_db...
#    Production database (protected): postgresql://...investia_db...
# ✅ Tests will NOT affect production data!
```

## Verificação

Para confirmar que está funcionando:

1. **Antes dos testes:** Verifique dados no banco principal
2. **Execute os testes:** `npm run test:e2e`
3. **Depois dos testes:** Dados do banco principal devem estar intactos

## ⚠️ IMPORTANTE

- **NUNCA** execute testes E2E sem configurar `DATABASE_URL_TEST`
- **SEMPRE** verifique os logs para confirmar que está usando o banco de teste
- O banco de teste é **limpo a cada execução** - isso é esperado e seguro

## Arquivos Modificados

- [.env.example](file:///home/valter/Documentos/Projetos/InvestIA/.env.example) - Adicionado `DATABASE_URL_TEST`
- [test/jest-e2e.json](file:///home/valter/Documentos/Projetos/InvestIA/test/jest-e2e.json) - Adicionado setup automático
- [test/setup-e2e.ts](file:///home/valter/Documentos/Projetos/InvestIA/test/setup-e2e.ts) - **NOVO** - Proteção automática

## Próximos Passos

1. Copiar `.env.example` para `.env` e configurar `DATABASE_URL_TEST`
2. Criar o banco de teste: `CREATE DATABASE investia_test_db;`
3. Rodar migrations no banco de teste
4. Executar testes com segurança!
