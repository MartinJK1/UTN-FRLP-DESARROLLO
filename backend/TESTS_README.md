# Guía de pruebas automatizadas del backend

Este documento describe la estrategia de testing implementada para el backend del sistema de gestión de turnos. El objetivo es garantizar que los endpoints críticos funcionen conforme a los requisitos funcionales mediante pruebas unitarias y de integración utilizando Jest y Supertest.

## Alcance actual

| Módulo / componente | Archivo de pruebas | Tipo | Cobertura funcional |
|---------------------|--------------------|------|---------------------|
| Reservas | `src/controllers/reservationController.test.ts` | Integración | Creación de reservas, validaciones de pertenencia y fecha |
| Vehículos | `src/controllers/vehicleController.test.ts` | Integración | Registro de vehículos, validaciones de campos y duplicados |
| Servicios | `src/controllers/serviceController.test.ts` | Integración | Alta de servicios, validación de datos y reglas de negocio |
| Middleware de autenticación | `src/middlewares/auth.middleware.test.ts` | Unitario | Manejo de tokens JWT válidos, expirados o ausentes |

> Los controladores restantes (usuarios, historial de servicios, etc.) se encuentran planificados para futuras iteraciones.

## Requisitos previos

- Node.js v18 o superior.
- Variables de entorno cargadas (ver `backend/.env` o `backend/.env.test` si se dispone de uno específico).
- Base de datos accesible; para entorno de pruebas se recomienda utilizar una instancia separada o la misma base con `DATABASE_URL` apuntando a un esquema distinto.
- Prisma client generado: `npx prisma generate`.

### Configuración recomendada para entorno de pruebas

```env
NODE_ENV=test
DATABASE_URL="postgresql://<usuario>:<password>@<host>:6543/postgres?schema=tests"
DIRECT_URL="postgresql://<usuario>:<password>@<host>:5432/postgres?schema=tests"
JWT_SECRET=<clave-secreta-para-tests>
```

Las pruebas crean y limpian los registros necesarios mediante `beforeAll` / `afterAll`. En caso de utilizar una base compartida, ejecutar `npx prisma migrate reset` antes de correr la suite para disponer de un estado consistente.

## Estructura y herramientas

- **Framework**: Jest (`jest.config.js` y `jest.setup.js`).
- **HTTP**: Supertest para simular requests a Express.
- **Mocks**: Se mockean dependencias externas cuando es necesario (por ejemplo, servicios de correo).
- **Limpieza**: Cada archivo de pruebas gestiona la creación y eliminación de datos propios, evitando interferencias entre suites.

## Ejecución de pruebas

### Ejecución con Docker (Recomendado)

Si estás usando Docker Compose para ejecutar el proyecto, ejecuta los tests dentro del contenedor:

```bash
# Opción 1: Ejecutar tests en el contenedor en ejecución
docker exec app_backend npm test

# Opción 2: Ejecutar tests en un contenedor temporal (recomendado)
docker-compose -f docker-compose.yml -f docker-compose.dev.yml run --rm backend npm test

# Ver resultados detallados
docker-compose -f docker-compose.yml -f docker-compose.dev.yml run --rm backend npm test -- --verbose

# Ejecutar en modo watch (desarrollo)
docker-compose -f docker-compose.yml -f docker-compose.dev.yml run --rm backend npm test -- --watch

# Generar reporte de cobertura
docker-compose -f docker-compose.yml -f docker-compose.dev.yml run --rm backend npm test -- --coverage
```

### Ejecución local (sin Docker)

Si prefieres ejecutar los tests localmente, asegúrate de tener todas las dependencias instaladas:

```bash
cd backend
npm install
npm run test

# Ver resultados detallados
npm run test -- --verbose

# Ejecutar en modo watch (desarrollo)
npm run test -- --watch

# Generar reporte de cobertura (si se desea)
npm run test -- --coverage
```

Los reportes de cobertura se generan en la carpeta `coverage/` (excluida del repositorio según `.gitignore`).

## Detalle de casos implementados

### Reservas
- Creación exitosa cuando el vehículo pertenece al usuario autenticado.
- Rechazo cuando el vehículo no pertenece al usuario o no existe (HTTP 400).
- Rechazo de reservas con fecha anterior a la actual (HTTP 400).

### Vehículos
- Registro exitoso con campos completos.
- Rechazo por campos obligatorios faltantes.
- Rechazo por patente duplicada.

### Servicios
- Creación exitosa con datos válidos.
- Rechazo por categoría inválida.
- Rechazo por precio y duración negativos o nulos.

### Middleware de autenticación
- Permite acceso con token válido.
- Rechaza solicitudes sin token (HTTP 401).
- Rechaza tokens inválidos o expirados (HTTP 401).

## Criterios de aceptación

- Todos los tests deben pasar sin warnings.
- Cobertura mínima esperada en controladores principales: 70% líneas/funciones (verificar con `--coverage`).
- Ejecutar la suite antes de cada commit relevante o previo al despliegue a entornos compartidos.




Ante inconvenientes, revisar logs generados por Jest y validar la conexión a la base definida en `DATABASE_URL`.
