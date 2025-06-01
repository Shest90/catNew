FROM node:18

WORKDIR /app

# Копируем package.json и lock-файл
COPY package*.json ./

# Устанавливаем все зависимости, включая dev-зависимости (чтобы был patch-package)
RUN npm install

# Копируем остальной проект
COPY . .

# Применяем патч — обязательно до сборки!
RUN npx patch-package

# Собираем проект
RUN npm run build

# Открываем порт
EXPOSE 3001

# Запускаем сервер
CMD ["npm", "run", "start:prod"]
