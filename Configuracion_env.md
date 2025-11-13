# Configuración de Variables de Entorno

## 📋 Archivos que necesitas configurar

### Frontend (Vercel)

1. **Copia el archivo de ejemplo:**
   ```bash
   cd Frontend
   cp env.example .env
   ```

2. **Edita `.env` con tus valores:**
   ```env
   VITE_API_URL=http://localhost:3000/api
   VITE_APP_NAME=Lubricentro Renault
   VITE_APP_VERSION=1.0.0
   ```

3. **Para producción en Vercel:**
   - Ve a tu proyecto en Vercel
   - Ve a Settings → Environment Variables
   - Agrega:
     - `VITE_API_URL` = `https://tu-backend-en-render.onrender.com/api`

### Backend (Render)

1. **Copia el archivo de ejemplo:**
   ```bash
   cd backend
   cp env.example .env
   ```

2. **Edita `.env` con tus valores:**
   ```env
   PORT=3000
   NODE_ENV=development
   # DATABASE_URL: Usa Supabase Pooler en modo SESSION con parámetros de pooling
   # Obtén esta URL desde: Supabase Dashboard → Settings → Database → Connection Pooling (Session mode)
   DATABASE_URL="postgresql://postgres.xxxx:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=5&pool_timeout=10"
   # DIRECT_URL: Conexión directa para migraciones (sin pooler, puerto 5432)
   # Obtén esta URL desde: Supabase Dashboard → Settings → Database → Connection string
   DIRECT_URL="postgresql://postgres.xxxx:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
   FRONTEND_URL=http://localhost:5173
   BACKEND_URL=http://localhost:3000
   JWT_SECRET=tu-jwt-secret-super-seguro
   API_VERSION=v1
   
   # Configuración de Brevo (Email)
   BREVO_API_KEY=tu-api-key-de-brevo
   BREVO_SENDER_EMAIL=noreply@tudominio.com
   BREVO_SENDER_NAME="Tu Lubricentro"
   ```

   **Parámetros importantes de DATABASE_URL:**
   - `pgbouncer=true` - Indica que usas pgBouncer (Supabase Pooler)
   - `connection_limit=5` - Límite de conexiones (5-10 para desarrollo, 10-20 para producción)
   - `pool_timeout=10` - Timeout de 10 segundos para adquirir conexión

3. **Para producción en Render:**
   - Ve a tu servicio en Render
   - Ve a Environment
   - Agrega estas variables:
     - `DATABASE_URL` = `postgresql://postgres.xxxx:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=10&pool_timeout=10`
     - `DIRECT_URL` = `postgresql://postgres.xxxx:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres`
     - `FRONTEND_URL` = tu URL de Vercel
     - `BACKEND_URL` = tu URL de Render
     - `JWT_SECRET` = un secreto seguro
     - `NODE_ENV` = production
     - `BREVO_API_KEY` = tu API key de Brevo
     - `BREVO_SENDER_EMAIL` = tu email de remitente
     - `BREVO_SENDER_NAME` = nombre de tu lubricentro

**Nota:** En producción usa `connection_limit=10` para mejor rendimiento
## 🔧 Pasos para configurar

### 1. Frontend Local
```bash
cd Frontend
cp env.example .env
# Edita .env con tus valores
npm run dev
```

### 2. Backend Local
```bash
cd backend
cp env.example .env
# Edita .env con tus valores
npm run dev
```

### 3. Deploy en Vercel
1. Conecta tu repositorio a Vercel
2. En Environment Variables, agrega `VITE_API_URL`
3. Deploy automático

### 4. Deploy en Render
1. Conecta tu repositorio a Render
2. En Environment, agrega todas las variables
3. Deploy automático

## ⚠️ Importante

- **NUNCA** subas archivos `.env` a Git
- Los archivos `.env` están en `.gitignore`
- Usa los archivos `env.example` como plantilla
- Genera JWT secrets seguros para producción

## 🚀 Optimizaciones de Rendimiento

### Connection Pooling con Supabase

Este proyecto está optimizado para usar **Supabase Pooler (Supavisor)** que maneja conexiones eficientemente:

1. **DATABASE_URL** usa el pooler (puerto 6543) con parámetros optimizados
2. **DIRECT_URL** es para migraciones (puerto 5432, sin pooler)
3. **Singleton pattern** en Prisma evita múltiples instancias
4. **StrictMode condicional** en frontend evita peticiones duplicadas en producción

### Cómo obtener tus URLs de Supabase:

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Navega a: **Settings** → **Database**
3. **Para DATABASE_URL**: Copia de **Connection Pooling** (Session mode, puerto 6543)
4. **Para DIRECT_URL**: Copia de **Connection string** (Direct connection, puerto 5432)
5. Agrega los parámetros: `?pgbouncer=true&connection_limit=5&pool_timeout=10`

**Documentación oficial:**
- [Prisma + Supabase](https://www.prisma.io/docs/orm/overview/databases/supabase)
- [Supabase Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres)