FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --legacy-peer-deps || true
COPY . .

# No instalar nodemon para evitar conflictos de I/O en Windows

EXPOSE 3000

# Variables de entorno para desarrollo y hot reload
ENV NODE_ENV=development
ENV CHOKIDAR_USEPOLLING=true

# Ejecutar el servidor de desarrollo de Next.js directamente
# Next.js ya maneja el hot reload (watch) internamente.
CMD ["npm", "run", "dev"]
