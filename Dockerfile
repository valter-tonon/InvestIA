# Dockerfile
FROM node:20-alpine

# Instala OpenSSL (necessário para Prisma)
RUN apk add --no-cache openssl

# Instala o Nest CLI globalmente
RUN npm i -g @nestjs/cli

WORKDIR /usr/src/app

# Copia package.json e package-lock.json primeiro (cache layer)
COPY package*.json ./

# Instala dependências
RUN npm install

# O código fonte será mapeado via volume em dev
COPY . .

# Gera o Prisma Client
RUN npx prisma generate || true

CMD ["npm", "run", "start:dev"]

