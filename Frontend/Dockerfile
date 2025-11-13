# 1. ---- Etapa de Desarrollo (Development Stage) ----
FROM node:20-alpine AS development
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]

# 2. ---- Etapa de Producción (Production Stage) ----
# Esta etapa construye la aplicación de React para producción
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 3. ---- Etapa de Producción (Production Stage) ----
# Esta etapa utiliza Nginx para servir los archivos estáticos generados por el builder.
FROM nginx:stable-alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]