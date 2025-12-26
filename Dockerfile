FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --legacy-peer-deps || true
COPY . .

# Instala nodemon globalmente para hot reload
RUN npm install -g nodemon

EXPOSE 3000

# Variables de entorno para desarrollo y hot reload
ENV NODE_ENV=development
ENV CHOKIDAR_USEPOLLING=true

# Usa nodemon para hot reload en desarrollo
CMD ["nodemon", "--legacy-watch", "--watch", ".", "--ext", "js,jsx,ts,tsx,json", "--exec", "npm run dev"]
