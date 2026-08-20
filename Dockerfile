FROM node:22-alpine
WORKDIR /app

# pnpm como gestor de paquetes
RUN npm install -g pnpm@10

# Instalar dependencias con el lockfile de pnpm (.npmrc: hoist de styled-jsx)
COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install

COPY . .

EXPOSE 3000

# Variables de entorno para desarrollo y hot reload
ENV NODE_ENV=development
ENV CHOKIDAR_USEPOLLING=true

# Next.js maneja el hot reload internamente
CMD ["pnpm", "run", "dev"]
