# Этап 1: Сборка проекта
FROM node:18 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

# Копируем остальной проект
COPY . .

# Устанавливаем переменную окружения прямо в момент сборки
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Сборка standalone-приложения
RUN npm run build

# Этап 2: Production образ
FROM node:18

WORKDIR /app

# Копируем только нужные файлы
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
# COPY --from=builder /app/.next/cache/workbox ./.next/cache/workbox
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

ENV HOST=0.0.0.0
EXPOSE 3000
CMD ["npx", "next", "start", "-H", "0.0.0.0"]
