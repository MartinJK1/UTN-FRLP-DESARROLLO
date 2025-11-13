# Matriz de Permisos - JWT por Módulo y Endpoint

## 📋 **Resumen de Implementación JWT**

Este documento detalla la implementación de autenticación y autorización JWT por módulo y endpoint en el sistema del Lubricentro Renault.

---

## 🔐 **Módulo AUTH (Autenticación)**

| Endpoint | Método | Autenticación | Autorización | Descripción |
|----------|--------|---------------|--------------|-------------|
| `/api/auth/register` | POST | ❌ No | - | Registro de nuevos usuarios |
| `/api/auth/login` | POST | ❌ No | - | Inicio de sesión de usuarios |
| `/api/auth/change-password` | POST | ✅ Sí | USER, ADMIN | Cambio de contraseña del usuario autenticado |
| `/api/auth/logout` | POST | ✅ Sí | USER, ADMIN | Cierre de sesión |

---

## 👤 **Módulo USERS (Usuarios)**

| Endpoint | Método | Autenticación | Autorización | Descripción |
|----------|--------|---------------|--------------|-------------|
| `/api/users/profile` | GET | ✅ Sí | USER, ADMIN | Obtener perfil del usuario autenticado |
| `/api/users/profile` | PUT | ✅ Sí | USER, ADMIN | Actualizar perfil del usuario autenticado |
| `/api/users` | GET | ✅ Sí | **Solo ADMIN** | Obtener todos los usuarios |
| `/api/users/:id` | GET | ✅ Sí | **Solo ADMIN** | Obtener usuario específico por ID |

---

## 🚗 **Módulo VEHICLES (Vehículos)**

| Endpoint | Método | Autenticación | Autorización | Descripción |
|----------|--------|---------------|--------------|-------------|
| `/api/vehicles` | POST | ✅ Sí | USER, ADMIN | Crear nuevo vehículo |
| `/api/vehicles` | GET | ✅ Sí | USER, ADMIN | Obtener vehículos del usuario autenticado |
| `/api/vehicles/:id` | GET | ✅ Sí | USER, ADMIN | Obtener vehículo específico |
| `/api/vehicles/:id` | PUT | ✅ Sí | USER, ADMIN | Actualizar vehículo |
| `/api/vehicles/:id` | DELETE | ✅ Sí | USER, ADMIN | Eliminar vehículo |
| `/api/vehicles/all` | GET | ✅ Sí | **Solo ADMIN** | Obtener TODOS los vehículos |

---

## 📅 **Módulo RESERVATIONS (Reservas)**

| Endpoint | Método | Autenticación | Autorización | Descripción |
|----------|--------|---------------|--------------|-------------|
| `/api/reservations` | POST | ✅ Sí | USER, ADMIN | Crear nueva reserva |
| `/api/reservations` | GET | ✅ Sí | **Solo ADMIN** | Obtener TODAS las reservas |
| `/api/reservations/user/:userId` | GET | ✅ Sí | **Solo ADMIN** | Obtener reservas de usuario específico |
| `/api/reservations/date/:date` | GET | ✅ Sí | USER, ADMIN | Obtener reservas por fecha |
| `/api/reservations/:id` | GET | ✅ Sí | USER, ADMIN | Obtener reserva específica |
| `/api/reservations/:id` | PUT | ✅ Sí | USER, ADMIN | Actualizar reserva |
| `/api/reservations/:id/cancel` | PATCH | ✅ Sí | USER, ADMIN | Cancelar reserva |

---

## 🛠️ **Módulo SERVICES (Servicios)**

| Endpoint | Método | Autenticación | Autorización | Descripción |
|----------|--------|---------------|--------------|-------------|
| `/api/services` | GET | ❌ No | - | Obtener todos los servicios (Público) |
| `/api/services/stats` | GET | ❌ No | - | Obtener estadísticas de servicios (Público) |
| `/api/services/search` | GET | ❌ No | - | Buscar servicios por nombre (Público) |
| `/api/services/category/:category` | GET | ❌ No | - | Obtener servicios por categoría (Público) |
| `/api/services/:id` | GET | ❌ No | - | Obtener servicio específico (Público) |
| `/api/services` | POST | ✅ Sí | **Solo ADMIN** | Crear nuevo servicio |
| `/api/services/:id` | PUT | ✅ Sí | **Solo ADMIN** | Actualizar servicio existente |
| `/api/services/:id` | DELETE | ✅ Sí | **Solo ADMIN** | Eliminar servicio (cambiar a inactivo) |
| `/api/services/:id/hard` | DELETE | ✅ Sí | **Solo ADMIN** | Eliminación física de servicio |

---

## 🏢 **Módulo ADMIN (Administración)**

| Endpoint | Método | Autenticación | Autorización | Descripción |
|----------|--------|---------------|--------------|-------------|
| `/api/admin/*` | ALL | ✅ Sí | **Solo ADMIN** | Todas las rutas de administración |

---

## 🔑 **Roles y Permisos**

### **USER (Usuario Regular)**
- ✅ Puede gestionar su propio perfil
- ✅ Puede gestionar sus propios vehículos
- ✅ Puede gestionar sus propias reservas
- ✅ Puede ver servicios públicos
- ❌ No puede ver otros usuarios
- ❌ No puede gestionar servicios
- ❌ No puede acceder a panel de administración

### **ADMIN (Administrador)**
- ✅ Todos los permisos de USER
- ✅ Puede ver todos los usuarios
- ✅ Puede ver todos los vehículos
- ✅ Puede ver todas las reservas
- ✅ Puede gestionar servicios
- ✅ Puede acceder a panel de administración

---

## 🛡️ **Implementación Técnica**

### **Middlewares Utilizados:**
- `authenticate`: Verifica el token JWT
- `authorize(...roles)`: Verifica que el usuario tenga los roles necesarios
- `validate(schema)`: Valida los datos de entrada con Zod

### **Estructura de Archivos:**
```
src/
├── middlewares/
│   ├── auth.middleware.ts      # authenticate, authorize
│   └── validation.middleware.ts # validate con Zod
├── services/
│   └── auth.service.ts         # Lógica de autenticación
├── controllers/
│   ├── auth.controller.ts      # Controladores de auth
│   ├── user.controller.ts      # Controladores de usuario
│   ├── adminController.ts      # Controladores de admin
│   ├── reservationController.ts # Controladores de reservas
│   ├── serviceController.ts    # Controladores de servicios
│   └── vehicleController.ts    # Controladores de vehículos
├── models/
│   ├── User.ts                 # Modelo de usuario
│   ├── Vehicle.ts              # Modelo de vehículo
│   ├── Reservation.ts          # Modelo de reserva
│   └── Service.ts              # Modelo de servicio
├── routes/
│   ├── auth.ts                 # Rutas de autenticación
│   ├── users.ts                # Rutas de usuarios
│   ├── vehicles.ts             # Rutas de vehículos
│   ├── reservations.ts         # Rutas de reservas
│   ├── services.ts             # Rutas de servicios
│   └── admin.ts                # Rutas de administración
├── validations/
│   ├── auth.validation.ts      # Esquemas de validación auth
│   ├── user.validation.ts      # Esquemas de validación user
│   └── vehicleValidation.ts    # Esquemas de validación vehículo
├── types/
│   ├── auth.types.ts           # Tipos TypeScript para auth
│   ├── user.ts                 # Tipos de usuario
│   ├── vehicle.ts              # Tipos de vehículo
│   ├── reservation.ts          # Tipos de reserva
│   ├── service.ts              # Tipos de servicio
│   └── admin.ts                # Tipos de admin
└── config/
    └── prisma.ts               # Configuración de Prisma
```

### **Variables de Entorno Requeridas:**
```env
JWT_SECRET=tu_secret_key_segura
JWT_EXPIRES_IN=2h
FRONTEND_URL=http://localhost:5173
```

---

## 📝 **Notas de Implementación**

1. **Rutas Públicas**: Solo los servicios de consulta son públicos para permitir que los clientes vean los servicios disponibles.

2. **Seguridad**: Todas las rutas de modificación requieren autenticación y autorización apropiada.

3. **Validación**: Se utiliza Zod para validar todos los datos de entrada.

4. **Tokens JWT**: Se incluyen en el header `Authorization: Bearer <token>`.

5. **Manejo de Errores**: Respuestas consistentes con códigos de estado HTTP apropiados.

---

## 🔄 **Cambios Realizados en la Implementación**

### **Estructura JWT Implementada según Profesor:**
- ✅ **Middlewares**: `authenticate` y `authorize(...roles)` implementados
- ✅ **Validaciones**: Esquemas Zod simplificados (sin anidación)
- ✅ **Servicios**: Lógica de autenticación separada en `auth.service.ts`
- ✅ **Controladores**: Separación de responsabilidades (auth vs user)
- ✅ **Rutas**: Protección por módulo con middlewares apropiados

### **Archivos Eliminados (Duplicados):**
- ❌ `src/middlewares/auth.ts` → Reemplazado por `auth.middleware.ts`
- ❌ `src/middlewares/validation.ts` → Reemplazado por `validation.middleware.ts`
- ❌ `src/validations/userValidation.ts` → Reemplazado por `user.validation.ts`
- ❌ `src/controllers/userController.ts` → Reemplazado por `user.controller.ts`

### **Configuración de Prisma:**
- ✅ **Esquema**: Mantenido PostgreSQL con Supabase
- ✅ **Cliente**: Configuración estándar `@prisma/client`
- ✅ **Imports**: Actualizados a configuración estándar

### **Estado Actual:**
- ✅ **Backend**: Funcionando con JWT implementado
- ✅ **Base de Datos**: Conectada a Supabase PostgreSQL
- ✅ **Validaciones**: Funcionando con Zod
- ✅ **Middlewares**: Implementados según formato del profesor

---
 
**Autor**: Equipo de Desarrollo - Lubricentro Renault
