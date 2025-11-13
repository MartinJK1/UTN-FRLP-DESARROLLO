# Backend del Sistema de Gestión de Turnos

API REST desarrollada con Node.js, Express y TypeScript para administrar usuarios, vehículos, servicios y reservas del lubricentro. Utiliza Prisma ORM contra PostgreSQL y expone endpoints protegidos con JWT.

## Contenido
- [Arquitectura y estructura](#arquitectura-y-estructura)
- [Requisitos](#requisitos)
- [Variables de entorno](#variables-de-entorno)
- [Instalación y ejecución local](#instalación-y-ejecución-local)
- [Scripts disponibles](#scripts-disponibles)
- [Migraciones y gestión de datos](#migraciones-y-gestión-de-datos)
- [Autenticación y roles](#autenticación-y-roles)
- [Documentación de la API](#documentación-de-la-api)
- [Despliegue](#despliegue)
- [Solución de problemas](#solución-de-problemas)
- [Recursos adicionales](#recursos-adicionales)

## Arquitectura y estructura
```
backend/
├── src/
│   ├── app.ts              # Bootstrap de Express
│   ├── config/             # Prisma, Swagger, logger
│   ├── controllers/        # Lógica HTTP por dominio
│   ├── middlewares/        # Autenticación, validaciones, errores
│   ├── models/             # Acceso a datos usando Prisma
│   ├── routes/             # Definición de endpoints por recurso
│   ├── services/           # Casos de uso y reglas de negocio
│   ├── types/              # Tipos compartidos
│   └── validations/        # Esquemas Zod
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── jest/ / tests/          # Pruebas unitarias y de integración
├── Dockerfile
└── package.json
```

## Requisitos
- Node.js v18 o superior.
- npm v9 o superior.
- Base de datos PostgreSQL (Supabase recomendado).
- Variables de entorno configuradas (ver sección siguiente).

## Variables de entorno
Crear `backend/.env` tomando como referencia `backend/.env.example`. Variables utilizadas:

```env
PORT=3000
NODE_ENV=development

# Conexión a PostgreSQL (Supabase)
DATABASE_URL="postgresql://<usuario>:<password>@<host>:6543/postgres?pgbouncer=true&connection_limit=5&pool_timeout=10"
DIRECT_URL="postgresql://<usuario>:<password>@<host>:5432/postgres"

# Integraciones y configuración
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000
JWT_SECRET=<clave-secreta-segura>
API_VERSION=v1

# Email (Brevo)
BREVO_API_KEY=<api-key>
BREVO_SENDER_EMAIL=noreply@tudominio.com
BREVO_SENDER_NAME="Lubricentro Renault"
```

> Detalle extendido en `Configuracion_env.md`, incluyendo recomendaciones para producción y notas sobre Supabase Pooler.

## Instalación y ejecución local
```bash
git clone https://github.com/<organizacion>/desarrollo-privado-grupal.git
cd desarrollo-privado-grupal/backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```
El servidor se expone en `http://localhost:3000` y la API en `http://localhost:3000/api/v1`.

## Scripts disponibles
| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor en modo desarrollo (ts-node-dev). |
| `npm run build` | Compila TypeScript a JavaScript en `dist/`. |
| `npm run start` | Ejecuta la versión compilada. |
| `npm run lint` | Corre ESLint sobre el código fuente. |
| `npm run test` | Ejecuta la suite de pruebas (ver `TESTS_README.md`). |
| `npx prisma migrate dev` | Aplica migraciones en desarrollo. |
| `npx prisma migrate deploy` | Aplica migraciones en producción. |
| `npx prisma db seed` | Ejecuta el seeding (si está configurado). |
| `npx prisma studio` | Abre Prisma Studio para inspección de datos. |

## Migraciones y gestión de datos
- El modelo de datos está definido en `prisma/schema.prisma`.
- Las migraciones se encuentran en `prisma/migrations/`.
- Para reiniciar el esquema en desarrollo: `npx prisma migrate reset`.
- Utiliza `DIRECT_URL` para operaciones de migración y `DATABASE_URL` (con Pooler) para ejecución en tiempo real.

## Autenticación y roles
- Autenticación mediante JWT en el header `Authorization: Bearer <token>`.
- Roles soportados: `ADMIN` y `CLIENTE`.
- Control de acceso implementado en `src/middlewares/auth.middleware.ts`.
- Zod valida las entradas en `src/validations/` y se aplica vía middleware de validación.

## Documentación de la API
- Rutas principales:
  - `POST /api/v1/auth/login`
  - `POST /api/v1/users`
  - `GET /api/v1/vehicles`
  - `POST /api/v1/reservations`
  - `GET /api/v1/services`
- Swagger/OpenAPI disponible en `http://localhost:3000/api/docs` (activar en `config/swagger.ts` si aún no está habilitado).
- Para más detalle de pruebas revisar `backend/TESTS_README.md`.

## Despliegue
- **Render / Railway**: definir variables de entorno anteriores y ejecutar `npm run start`.
- **Docker**:
  ```bash
  docker-compose -f ../docker-compose.yml -f ../docker-compose.prod.yml up --build backend
  ```
  Utiliza la etapa `production` del `Dockerfile`.
- Asegurar que `DATABASE_URL` use el pooler (puerto 6543) y `DIRECT_URL` el puerto 5432.

## Solución de problemas
- `PrismaClientInitializationError`: validar credenciales y puertos en Supabase. Ejecutar `npx prisma generate` y reintentar.
- `P1001` (no se puede conectar al servidor): verificar IP habilitada en Supabase o estado del pooler.
- JWT inválido: regenerar `JWT_SECRET` y limpiar caché de clientes.
- Migraciones inconsistentes: ejecutar `npx prisma migrate resolve --applied <migration_id>` o reiniciar con `npx prisma migrate reset` en desarrollo.

## Recursos adicionales
- Documentación de configuración: `../Configuracion_env.md`
- README del frontend: `../Frontend/README.md`
- Guía de dockerización: `../docker.md`
- Documentación funcional y de negocio: `../Documentación/`
