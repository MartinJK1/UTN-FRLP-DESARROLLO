import { Router } from 'express';
import { 
  createService,           // CREATE - Crear nuevo servicio
  getAllServices,          // READ - Obtener todos los servicios
  getServiceById,          // READ - Obtener servicio por ID
  getServicesByCategory,   // READ - Obtener servicios por categoría
  searchServices,          // READ - Buscar servicios por nombre
  updateService,           // UPDATE - Actualizar servicio existente
  deleteService,           // DELETE - Eliminar servicio (cambiar a inactivo)
  hardDeleteService,       // DELETE - Eliminación física (solo admin)
  getServiceStats          // READ - Obtener estadísticas
} from '../controllers/serviceController';
import { authenticate, authorize } from '../middlewares/auth.middleware';

// Crear el router para las rutas de servicios
const router = Router();

/**
 * @swagger
 * /api/services:
 *   get:
 *     summary: Obtiene todos los servicios
 *     tags: [Services]
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filtra por servicios activos o inactivos
 *     responses:
 *       200:
 *         description: Lista de servicios
 */
router.get('/', getAllServices);

/**
 * @swagger
 * /api/services/stats:
 *   get:
 *     summary: Obtiene estadísticas de los servicios
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: Estadísticas de servicios
 */
router.get('/stats', getServiceStats);

/**
 * @swagger
 * /api/services/search:
 *   get:
 *     summary: Busca servicios por nombre
 *     tags: [Services]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Término de búsqueda
 *     responses:
 *       200:
 *         description: Lista de servicios encontrados
 */
router.get('/search', searchServices);

/**
 * @swagger
 * /api/services/category/{category}:
 *   get:
 *     summary: Obtiene servicios por categoría
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         description: Categoría del servicio
 *     responses:
 *       200:
 *         description: Lista de servicios en la categoría
 */
router.get('/category/:category', getServicesByCategory);

/**
 * @swagger
 * /api/services/{id}:
 *   get:
 *     summary: Obtiene un servicio por ID
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Datos del servicio
 *       404:
 *         description: Servicio no encontrado
 */
router.get('/:id', getServiceById);

/**
 * @swagger
 * /api/services:
 *   post:
 *     summary: Crea un nuevo servicio (solo Admin)
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               duration:
 *                 type: integer
 *               category:
 *                 type: string
 *     responses:
 *       201:
 *         description: Servicio creado
 *       400:
 *         description: Error en la solicitud
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido
 */
router.post('/', authenticate, authorize('ADMIN'), createService);

/**
 * @swagger
 * /api/services/{id}:
 *   put:
 *     summary: Actualiza un servicio (solo Admin)
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               duration:
 *                 type: integer
 *               category:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Servicio actualizado
 *       400:
 *         description: Error en la solicitud
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido
 *       404:
 *         description: Servicio no encontrado
 */
router.put('/:id', authenticate, authorize('ADMIN'), updateService);

/**
 * @swagger
 * /api/services/{id}:
 *   delete:
 *     summary: Desactiva un servicio (solo Admin)
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Servicio desactivado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido
 *       404:
 *         description: Servicio no encontrado
 */
router.delete('/:id', authenticate, authorize('ADMIN'), deleteService);

/**
 * @swagger
 * /api/services/{id}/hard:
 *   delete:
 *     summary: Elimina un servicio permanentemente (solo Admin)
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Servicio eliminado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido
 *       404:
 *         description: Servicio no encontrado
 */
router.delete('/:id/hard', authenticate, authorize('ADMIN'), hardDeleteService);

// ========================================
// ORDEN DE LAS RUTAS - MUY IMPORTANTE
// ========================================
// Las rutas más específicas deben ir ANTES que las más genéricas
// 
//CORRECTO:
// 1. /stats (específica)
// 2. /search (específica)  
// 3. /category/:category (específica)
// 4. /:id (genérica)
// 5. / (genérica)
//
// INCORRECTO:
// 1. /:id (genérica) - Esto capturaría /stats, /search, etc.
// 2. /stats (específica) - Nunca se ejecutaría

export const serviceRoutes = router;