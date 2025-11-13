<<<<<<< HEAD
# UTN-DS25-Grupo6 — Sistema de Gestión de Turnos

Plataforma web desarrollada para el Lubricentro Renault con el objetivo de digitalizar la reserva de turnos, gestionar vehículos y mantener el historial de servicios.

## **URL del proyecto**

- Link: [utn-ds-25-grupo6.vercel.app](https://utn-ds-25-grupo6.vercel.app/)
- Usuarios de prueba:
  - Usuario normal: usuario@gmail.com
    - Contraseña: Usuario1
  - Usuario Admin: pablito@gmail.com
    - Contraseña: Usuario1!

## Índice
- [Información general](#información-general)
- [Arquitectura](#arquitectura)
- [Equipo](#equipo)
- [Documentación funcional](#documentación-funcional)
- [Puesta en marcha](#puesta-en-marcha)
- [Notas relevantes](#notas-relevantes)
- [Estructura asociada a Docker](#estructura-asociada-a-docker)
- [Contacto](#contacto)

## Información general
- URL pública (preview Vercel): [https://utn-ds-25-grupo6.vercel.app](https://utn-ds-25-grupo6.vercel.app)
- Stack principal: React (frontend) + Node.js/Express + Prisma (backend) + PostgreSQL (Supabase).
- Gestión de autenticación mediante JWT con roles `CLIENTE` y `ADMIN`.

- Deploy sugerido: Frontend en Vercel, Backend en Render/Supabase para base de datos.
- Documentación técnica específica en `Frontend/README.md`, `backend/README.md` y `Configuracion_env.md`.

## Equipo
| Nombre | Legajo | Alias Slack | GitHub |
|--------|--------|-------------|--------|
| Pedro Moyano | 31411 | Pedro Moyano | [moyanop](https://github.com/moyanop) |
| Franco Javier Portillo Colinas | 31089 | Franco Portillo | [FrancoPortillo](https://github.com/FrancoPortillo) |
| Axel Agustin Gonzalez Blasco | 31303 | Agustin Gonzalez Blasco | [Agusgb](https://github.com/Agusgb) |
| Kaufman Martin Javier | 32536 | Martín Kaufman | [MartinJK1](https://github.com/MartinJK1) |
| Kaufman Sebastian Leonel | 30616 | Sebastian Kaufman | [S-kfmN](https://github.com/S-kfmN) |
| Elias Caracas | 31780 | Elias Caracas | [ecaracasdev](https://github.com/ecaracasdev) |

## Documentación funcional
Los entregables del proyecto se encuentran en `Documentación/README.md`. Resumen de contenido:
- Visión y alcance del producto.
- Análisis inicial y modelado de dominio.
- Product backlog, validación y trazabilidad.
- Diseño UX/UI y relevamiento de API.
- Matriz de permisos y retrospectivas de sprint.

## Puesta en marcha
### Requerimientos previos
- Node.js 18+ y npm 9+.
- Docker Desktop (opcional para despliegues contenedorizados).
- Variables de entorno configuradas de acuerdo a `Configuracion_env.md`.

### Ejecución local sin Docker
1. Clonar el repositorio:
   ```bash
   git clone https://github.com/<organizacion>/desarrollo-privado-grupal.git
   cd desarrollo-privado-grupal
   ```
2. Configurar variables:
   ```bash
   cp backend/.env.example backend/.env
   cp Frontend/.env.example Frontend/.env
   ```
   Completar los valores según instrucciones del documento de configuración.
3. Backend:
   ```bash
   cd backend
   npm install
   npx prisma migrate dev --name init
   npm run dev
   ```
4. Frontend (en otra terminal):
   ```bash
   cd Frontend
   npm install
   npm run dev
   ```
5. Accesos:
   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:3000`

### Ejecución con Docker
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```
- Frontend disponible en `http://localhost:5173`
- Backend disponible en `http://localhost:3000`

Para un build productivo usar `docker-compose.prod.yml`. Detalles adicionales en `docker.md`.

## Notas relevantes
- Los archivos `.env` reales no deben versionarse (ya están excluidos).
- Ejecutar las suites de pruebas antes de cada entrega (`backend/TESTS_README.md` describe el alcance).
- Validar conectividad con Supabase antes de correr migraciones o tests.

## Estructura asociada a Docker
- `docker-compose.yml`
- `docker-compose.dev.yml`
- `docker-compose.prod.yml`
- `backend/Dockerfile`
- `backend/.dockerignore`
- `Frontend/Dockerfile`
- `Frontend/.dockerignore`

## Contacto
Ante dudas técnicas utilizar el canal de Slack del grupo o abrir un issue en el repositorio institucional.
=======
# prueba-desarrollo-grupo-6
>>>>>>> bc345cf7126c9e50c5bd1557f7ab69f556bd6fa4
