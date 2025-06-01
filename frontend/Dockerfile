# Этап 1: Сборка проекта
FROM node:18 AS builder

WORKDIR /app

# Установка зависимостей
COPY package*.json ./
RUN npm ci

# Копируем весь проект
COPY . .

# Сборка production-версии Next.js
RUN npm run build

# Этап 2: Production-образ
FROM node:18

WORKDIR /app

# Копируем только нужное из builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/next-env.d.ts ./next-env.d.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Структура через src — копируем её
COPY --from=builder /app/src ./src

EXPOSE 3000

CMD ["node", ".next/standalone/server.js"]

