# 🗄️ Convenções de Banco de Dados - InvestIA

## PostgreSQL + Prisma

### Nomenclatura

| Elemento | Convenção | Exemplo |
|----------|-----------|---------|
| Tabela | snake_case plural | `strategy_profiles` |
| Coluna | snake_case | `created_at`, `user_id` |
| Index | `idx_tabela_coluna` | `idx_assets_ticker` |
| FK | `fk_origem_destino` | `fk_wallet_user` |
| Enum | PascalCase | `AssetType` |

### Campos Padrão

Toda tabela deve ter:
```prisma
model Example {
  id        String   @id @default(uuid())
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  @@map("examples")
}
```

---

## Tipos de Dados

| Tipo Lógico | Prisma | PostgreSQL |
|-------------|--------|------------|
| ID | `String @id @default(uuid())` | UUID |
| Texto curto | `String` | VARCHAR(255) |
| Texto longo | `String?` | TEXT |
| Inteiro | `Int` | INTEGER |
| Decimal | `Float` | DOUBLE PRECISION |
| Dinheiro | `Decimal @db.Decimal(15,2)` | DECIMAL(15,2) |
| JSON | `Json` | JSONB |
| Boolean | `Boolean` | BOOLEAN |
| Data/Hora | `DateTime` | TIMESTAMP WITH TIME ZONE |

---

## Relacionamentos

### One-to-Many
```prisma
model User {
  id      String   @id @default(uuid())
  wallets Wallet[]
}

model Wallet {
  id     String @id @default(uuid())
  userId String @map("user_id")
  user   User   @relation(fields: [userId], references: [id])
  
  @@map("wallets")
}
```

### Many-to-Many (explícito)
```prisma
model WalletAsset {
  id       String @id @default(uuid())
  walletId String @map("wallet_id")
  assetId  String @map("asset_id")
  
  wallet   Wallet @relation(fields: [walletId], references: [id])
  asset    Asset  @relation(fields: [assetId], references: [id])
  
  @@unique([walletId, assetId])
  @@map("wallet_assets")
}
```

---

## Migrations

### Comandos
```bash
# Criar migration
docker compose exec app npx prisma migrate dev --name descricao_curta

# Aplicar em produção
docker compose exec app npx prisma migrate deploy

# Reset (dev only)
docker compose exec app npx prisma migrate reset
```

### Nomenclatura de Migrations
- `init` - Criação inicial
- `add_coluna_tabela` - Adicionar coluna
- `remove_coluna_tabela` - Remover coluna
- `alter_tabela_mudanca` - Alterar estrutura

---

## Índices

### Quando criar índice:
- Colunas usadas em WHERE frequente
- Colunas de ordenação (ORDER BY)
- Foreign Keys (Prisma cria automaticamente)
- Colunas únicas

### Exemplo Prisma
```prisma
model Asset {
  ticker String @unique
  type   String
  
  @@index([type])
  @@map("assets")
}
```

---

## Soft Delete

Quando necessário, usar:
```prisma
model Resource {
  deletedAt DateTime? @map("deleted_at")
}
```

Query padrão: `where: { deletedAt: null }`
