FROM node:20-slim

WORKDIR /app

# Dépendances (couche cachée tant que package*.json ne change pas)
COPY package*.json ./
RUN npm ci --omit=dev

# Code de l'application
COPY . .

EXPOSE 3000

CMD ["node", "www/app.js"]
