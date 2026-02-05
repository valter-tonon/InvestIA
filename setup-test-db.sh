#!/bin/bash

# Script para configurar o banco de dados de testes
# Este script garante que você tem um banco de teste separado e seguro

set -e

echo "🧪 Configurando banco de dados de testes..."
echo ""

# 1. Verificar se DATABASE_URL_TEST está no .env
if ! grep -q "DATABASE_URL_TEST" .env 2>/dev/null; then
    echo "⚠️  DATABASE_URL_TEST não encontrado no .env"
    echo "📝 Adicionando DATABASE_URL_TEST ao .env..."
    echo "DATABASE_URL_TEST=postgresql://sardinha:sardinha123@db:5432/investia_test_db?schema=public" >> .env
    echo "✅ DATABASE_URL_TEST adicionado!"
else
    echo "✅ DATABASE_URL_TEST já configurado no .env"
fi

echo ""

# 2. Criar banco de teste (ignora erro se já existe)
echo "📦 Criando banco de dados de teste..."
docker compose exec db psql -U sardinha -d investia_db -c "CREATE DATABASE investia_test_db;" 2>/dev/null || echo "ℹ️  Banco de teste já existe"

echo ""

# 3. Rodar migrations no banco de teste
echo "🔄 Aplicando migrations no banco de teste..."
docker compose exec app sh -c 'export DATABASE_URL="postgresql://sardinha:sardinha123@db:5432/investia_test_db?schema=public" && npx prisma migrate deploy'

echo ""
echo "✅ Banco de dados de teste configurado com sucesso!"
echo ""
echo "📊 Resumo:"
echo "   - Banco principal: investia_db (PROTEGIDO)"
echo "   - Banco de testes: investia_test_db (usado pelos testes E2E)"
echo ""
echo "🧪 Para rodar os testes E2E com segurança:"
echo "   docker compose exec app npm run test:e2e"
echo ""
