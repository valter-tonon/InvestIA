# Dockerfile
FROM node:20-alpine

# Instala OpenSSL (necessário para Prisma)
RUN apk add --no-cache openssl

# Instala o Nest CLI globalmente
RUN npm i -g @nestjs/cli

# Criar usuário não-root para segurança
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

WORKDIR /usr/src/app

# Copia package.json e package-lock.json primeiro (cache layer)
COPY package*.json ./

# Instala dependências
RUN npm install

# O código fonte será mapeado via volume em dev
COPY . .

# Gera o Prisma Client
RUN npx prisma generate || true

# Criar diretórios writable com permissões corretas
RUN mkdir -p /usr/src/app/public /usr/src/app/uploads && \
    chown -R nestjs:nodejs /usr/src/app

# Usar usuário não-root
USER nestjs

CMD ["npm", "run", "start:dev"]

