# 1. ---- Etapa de Builder (Constructor) ----
# Esta etapa instala todas las dependencias (incluidas las de desarrollo),
# genera el cliente de Prisma y compila el código de TypeScript a JavaScript.
FROM node:20-slim AS builder
RUN apt-get update -y && apt-get install -y openssl
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY prisma ./prisma/
COPY . .
RUN npx prisma generate
RUN npm run build

# 2. ---- Etapa de Producción ----
# Esta es la imagen final y ligera. Comienza desde cero y copia solo lo necesario.
FROM node:20-slim AS production
WORKDIR /app
ENV NODE_ENV=production

# Instala solo las dependencias de producción
COPY package*.json ./
RUN npm install --omit=dev

# Copia el código de la aplicación ya compilado y el cliente de Prisma desde la etapa de builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
# Copia el archivo de schema de Prisma, que es necesario en tiempo de ejecución
COPY --from=builder /app/prisma/schema.prisma ./prisma/schema.prisma

EXPOSE 3000
# El comando para iniciar la aplicación en producción
CMD ["npm", "start"]