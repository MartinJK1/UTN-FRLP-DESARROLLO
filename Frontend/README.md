# Frontend del Sistema de Gestión de Turnos

Aplicación web desarrollada con React y Vite que implementa la interfaz del sistema de turnos para el lubricentro. Proporciona vistas públicas y privadas, diferenciación de roles, gestión de reservas, vehículos y panel de administración.

## Contenido
- [Requisitos previos](#requisitos-previos)
- [Configuración del entorno](#configuración-del-entorno)
- [Instalación y ejecución](#instalación-y-ejecución)
- [Scripts disponibles](#scripts-disponibles)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Integración con el backend](#integración-con-el-backend)
- [Estilos y lineamientos de UI](#estilos-y-lineamientos-de-ui)
- [Buenas prácticas y criterios funcionales](#buenas-prácticas-y-criterios-funcionales)
- [Despliegue](#despliegue)
- [Soporte y contacto](#soporte-y-contacto)

## Requisitos previos
- Node.js v18 o superior.
- npm v9 o superior.
- Backend ejecutándose en `http://localhost:3000` (configurable).

## Configuración del entorno
1. Duplicar el archivo `Frontend/.env.example` como `Frontend/.env`.
2. Completar las variables:
   ```env
   VITE_API_URL=http://localhost:3000/api
   VITE_APP_NAME=Lubricentro Renault
   VITE_APP_VERSION=1.0.0
   ```
3. Para despliegues, ajustar `VITE_API_URL` al dominio público del backend.

#



## Estructura del proyecto
```
Frontend/
├── public/                 # Recursos estáticos servidos sin procesamiento
├── src/
│   ├── assets/             # Imágenes y estilos compartidos
│   ├── components/         # Componentes reutilizables (Navbar, formularios, modales)
│   ├── config/             # Configuración de API y constantes (api)
│   ├── context/            # Contextos globales (autenticación, estado global)
│   ├── hooks/              # Hooks personalizados (reservas, usuarios, vehículos)
│   ├── pages/              # Páginas principales (reservas, panel admin, etc.)
│   ├── services/           # Comunicaciones HTTP centralizadas (apiService)
│   ├── utils/              # Funciones auxiliares (fechas, dividirName)
│   ├── validations/        # Esquemas de validación con Yup
│   ├── App.jsx             # Definición de rutas y layout general
│   └── main.jsx            # Punto de entrada de React
├── package.json
└── vite.config.js
```

## Integración con el backend
- Las rutas de la API se construyen a partir de `VITE_API_URL`.
- Se utiliza React Query para manejo de peticiones, caché y sincronización.
- Los tokens JWT emitidos por el backend se almacenan en `localStorage` y se distribuyen mediante `AuthContext`.
- Los roles (`CLIENT`, `ADMIN`) se interpretan en el frontend para habilitar o restringir vistas y acciones.

## Estilos y lineamientos de UI
- Paleta cromática alineada a la identidad de marca del lubricentro (negro, blanco y amarillo).
- Diseño responsive: mobile first, con adaptación para tablet y escritorio.
- Componentes principales:
  - Formularios de autenticación y registro.
  - Gestión de reservas con calendario interactivo.
  - Panel administrativo con tablas, filtros y acciones sobre usuarios, vehículos y reservas.
- Uso de CSS modularizado en `src/assets/styles` y componentes con estilos específicos cuando aplica.

## Buenas prácticas y criterios funcionales
- Validaciones en cliente con Yup para minimizar errores antes de enviar al backend.
- Manejo centralizado de errores y notificaciones para feedback al usuario.
- Protección de rutas mediante higher-order components y guardias de navegación.
- Los estados derivados del backend (reservas confirmadas, canceladas, etc.) se muestran con badges y colores consistentes.

## Despliegue
- **Vercel/Netlify**: configurar `VITE_API_URL` en las variables del entorno del build.
- **Docker**: utilizar el `Dockerfile` multietapa del directorio y el `docker-compose.prod.yml` de la raíz del proyecto.
- Tras el despliegue, verificar:
  - Configuración CORS en el backend.
  - Disponibilidad del endpoint `/api/health` (si existe) para monitoreo.
  - Respuesta adecuada de las rutas protegidas según rol.

## Soporte y contacto
Para consultas técnicas sobre el frontend dirigirse al equipo de desarrollo de la UTN-DS25-Grupo6 mediante el canal oficial del proyecto o abrir un issue en el repositorio.
