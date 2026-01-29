# 🔌 Padrões de API - InvestIA

## Convenções REST

### Endpoints

| Método | Path | Descrição |
|--------|------|-----------|
| GET | `/resources` | Listar (com paginação) |
| GET | `/resources/:id` | Detalhe único |
| POST | `/resources` | Criar |
| PUT | `/resources/:id` | Atualizar completo |
| PATCH | `/resources/:id` | Atualizar parcial |
| DELETE | `/resources/:id` | Remover |

### Nomenclatura
- Usar **plural** para recursos: `/assets`, `/wallets`
- Usar **kebab-case** para multi-palavras: `/strategy-profiles`
- Ações especiais: `/assets/:id/analyze`

---

## Formato de Resposta

### Sucesso
```json
{
  "data": { ... },
  "meta": {
    "timestamp": "2026-01-29T18:00:00Z"
  }
}
```

### Lista com Paginação
```json
{
  "data": [ ... ],
  "meta": {
    "total": 100,
    "page": 1,
    "perPage": 20,
    "lastPage": 5
  }
}
```

### Erro
```json
{
  "error": {
    "code": "ASSET_NOT_FOUND",
    "message": "Ativo com ticker XXXX não encontrado",
    "statusCode": 404
  }
}
```

---

## Códigos de Erro

| Código | HTTP | Descrição |
|--------|------|-----------|
| `VALIDATION_ERROR` | 400 | Dados inválidos |
| `UNAUTHORIZED` | 401 | Não autenticado |
| `FORBIDDEN` | 403 | Sem permissão |
| `NOT_FOUND` | 404 | Recurso não existe |
| `CONFLICT` | 409 | Conflito (duplicado) |
| `INTERNAL_ERROR` | 500 | Erro interno |

---

## Paginação

### Query Parameters
- `page`: Número da página (default: 1)
- `perPage`: Itens por página (default: 20, max: 100)
- `sort`: Campo de ordenação (`createdAt`, `-updatedAt`)
- `filter[field]`: Filtros específicos

### Exemplo
```
GET /assets?page=2&perPage=50&sort=-dividendYield&filter[type]=REIT
```

---

## Autenticação

### JWT Bearer Token
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Endpoints Públicos
- `POST /auth/login`
- `POST /auth/register`
- `POST /auth/refresh`

### Endpoints Protegidos
- Todos os outros (requerem token válido)

---

## Versionamento

- Versão na URL: `/api/v1/assets`
- Header opcional: `X-API-Version: 1`

---

## Rate Limiting

- 100 requests/minuto por usuário
- 1000 requests/hora por usuário
- Headers de resposta:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`
