import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Importar rutas
import { authRoutes } from './routes/auth';
import { userRoutes } from './routes/users';
import { vehicleRoutes } from './routes/vehicles';
import { reservationRoutes } from './routes/reservations';
import { serviceRoutes } from './routes/services';
import { serviceHistoryRoutes } from './routes/serviceHistory';
import adminRoutes from './routes/admin';
import { swaggerDocs } from './config/swagger';

// Cargar variables de entorno
dotenv.config();

// Inicializar Prisma Client
import prisma, { disconnectPrisma } from './config/prisma';

// Crear la aplicación Express
const app = express();

// Puerto donde correrá el servidor
const PORT = process.env.PORT || 3000;

// Lista de orígenes permitidos (whitelist)
// Permite múltiples URLs separadas por comas en FRONTEND_URL
const parseFrontendUrls = (urls: string | undefined): string[] => {
  if (!urls) return [];
  return urls.split(',').map(url => url.trim()).filter(Boolean);
};

const whitelist = [
  // URLs de desarrollo local
  'http://localhost:5173', // Desarrollo de Frontend (Vite)
  'http://localhost',      // Frontend de Producción (Docker con Nginx en puerto 80)
  'http://localhost:3000',
  // URLs de producción desde variables de entorno
  ...parseFrontendUrls(process.env.FRONTEND_URL)
].filter(Boolean); // Filtra valores undefined/null

// Configuración de CORS
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Permite peticiones sin origen (como las de Postman o apps móviles)
    if (!origin) return callback(null, true);
    
    // Log para debugging (solo en desarrollo)
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔍 CORS: Origen recibido:', origin);
      console.log('🔍 CORS: Whitelist:', whitelist);
    }
    
    if (whitelist.indexOf(origin) !== -1) {
      // Si el origen está en la lista blanca, permitir la petición
      callback(null, true);
    } else {
      // Si no, rechazarla
      console.error('❌ CORS: Origen no permitido:', origin);
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// MIDDLEWARES GLOBALES - Se ejecutan en todas las peticiones
// Configurar helmet para no bloquear CORS
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));
app.use(cors(corsOptions)); // Permite peticiones desde el frontend con configuración específica
app.use(morgan('dev'));   // Logs de peticiones HTTP (para debugging)
app.use(express.json());  // Permite recibir JSON en el body de las peticiones

// Servir documentación de Swagger
swaggerDocs(app, Number(PORT));

// Middleware para hacer Prisma disponible en todas las rutas
app.use((req, res, next) => {
  (req as any).prisma = prisma;
  next();
});

// RUTAS DE LA API
app.use('/api/auth', authRoutes);           // /api/auth/register, /api/auth/login
app.use('/api/users', userRoutes);          // /api/users/profile, /api/users/change-password
app.use('/api/vehicles', vehicleRoutes);    // /api/vehicles (CRUD de vehículos)
app.use('/api/reservations', reservationRoutes); // CRUD de reservas
console.log(' Ruta /api/reservations registrada');
app.use('/api/services', serviceRoutes);    // CRUD de servicios
console.log(' Ruta /api/services registrada');
app.use('/api/services', serviceHistoryRoutes); // Historial de servicios
console.log(' Ruta /api/services/history registrada');
app.use('/api/admin', adminRoutes);         // Panel de administración
console.log(' Ruta /api/admin registrada');

// RUTA DE PRUEBA - Para verificar que el servidor funciona
app.get('/', (req, res) => {
  res.json({
    message: 'API del Lubricentro Renault funcionando!',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      vehicles: '/api/vehicles',
      reservations: '/api/reservations',
      services: '/api/services',
      serviceHistory: '/api/services/history',
      admin: '/api/admin'
    }
  });
});

// MANEJADOR DE ERRORES - Para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Función para probar la conexión a la base de datos
async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log(' Conexión a la base de datos establecida correctamente');
  } catch (error) {
    console.error(' Error al conectar con la base de datos:', error);
    process.exit(1);
  }
}

// INICIAR EL SERVIDOR
const server = app.listen(PORT, async () => {
  console.log(` Servidor corriendo en puerto ${PORT}`);
  console.log(` API disponible en: http://localhost:${PORT}`);
  console.log(` Endpoints de autenticación: http://localhost:${PORT}/api/auth`);
  console.log(` Endpoints de usuarios: http://localhost:${PORT}/api/users`);
  console.log(` Endpoints de vehículos: http://localhost:${PORT}/api/vehicles`);
  console.log(` Endpoints de reservas: http://localhost:${PORT}/api/reservations`);
  console.log(` Endpoints de servicios: http://localhost:${PORT}/api/services`);
  console.log(` Historial de servicios: http://localhost:${PORT}/api/services/history`);
  console.log(` Panel de administración: http://localhost:${PORT}/api/admin`);
  
  // Probar conexión a la base de datos
  await testDatabaseConnection();
});

// Manejo graceful de cierre
process.on('SIGINT', async () => {
  console.log(' Cerrando servidor...');
  await prisma.$disconnect();
  server.close(() => {
    console.log(' Servidor cerrado correctamente');
    process.exit(0);
  });
});

process.on('SIGTERM', async () => {
  console.log(' Cerrando servidor...');
  await disconnectPrisma();
  server.close(() => {
    console.log(' Servidor cerrado correctamente');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log(' Cerrando servidor...');
  await disconnectPrisma();
  server.close(() => {
    console.log(' Servidor cerrado correctamente');
    process.exit(0);
  });
});

export default app;