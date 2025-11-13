import { Router } from 'express';
import { 
  createServiceHistory,           // CREATE - Registrar nuevo servicio en historial
  getServiceHistoryByVehicle,     // READ - Obtener historial por vehículo (patente)
  getServiceHistoryByUser,       // READ - Obtener historial por usuario
  getAllServiceHistory,           // READ - Obtener todo el historial (solo ADMIN)
  getServiceHistoryStats,        // READ - Obtener estadísticas del historial
  updateServiceHistory,          // UPDATE - Actualizar registro del historial
  deleteServiceHistory           // DELETE - Eliminar registro del historial
} from '../controllers/serviceHistoryController';
import { authenticate, authorize } from '../middlewares/auth.middleware';

// Crear el router para las rutas del historial de servicios
const router = Router();

/**
 * @swagger
 * /api/services/history:
 *   post:
 *     summary: Registra un nuevo servicio en el historial (solo Admin y Mechanic)
 *     tags: [Service History]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               vehicleId:
 *                 type: string
 *               serviceId:
 *                 type: string
 *               resultado:
 *                 type: string
 *               observaciones:
 *                 type: string
 *               kilometraje:
 *                 type: integer
 *               mecanico:
 *                 type: string
 *               registradoPor:
 *                 type: string
 *     responses:
 *       201:
 *         description: Historial de servicio creado
 *       400:
 *         description: Error en la solicitud
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido
 */
router.post('/history', authenticate, authorize('ADMIN', 'MECHANIC'), createServiceHistory);

/**
 * @swagger
 * /api/services/history/vehicle:
 *   get:
 *     summary: Obtiene el historial de un vehículo por patente
 *     tags: [Service History]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: patente
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Historial del vehículo
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Vehículo no encontrado
 */
router.get('/history/vehicle', authenticate, getServiceHistoryByVehicle);

/**
 * @swagger
 * /api/services/history/user/{userId}:
 *   get:
 *     summary: Obtiene el historial de un usuario
 *     tags: [Service History]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Historial del usuario
 *       401:
 *         description: No autorizado
 */
router.get('/history/user/:userId', authenticate, getServiceHistoryByUser);

/**
 * @swagger
 * /api/services/history/all:
 *   get:
 *     summary: Obtiene todo el historial de servicios (solo Admin)
 *     tags: [Service History]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Historial de todos los servicios
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido
 */
router.get('/history/all', authenticate, authorize('ADMIN'), getAllServiceHistory);

/**
 * @swagger
 * /api/services/history/stats:
 *   get:
 *     summary: Obtiene estadísticas del historial
 *     tags: [Service History]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas del historial
 *       401:
 *         description: No autorizado
 */
router.get('/history/stats', authenticate, getServiceHistoryStats);

/**
 * @swagger
 * /api/services/history/{id}:
 *   put:
 *     summary: Actualiza un registro del historial (solo Admin)
 *     tags: [Service History]
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
 *               resultado:
 *                 type: string
 *               observaciones:
 *                 type: string
 *               kilometraje:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Registro actualizado
 *       400:
 *         description: Error en la solicitud
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido
 *       404:
 *         description: Registro no encontrado
 */
router.put('/history/:id', authenticate, authorize('ADMIN'), updateServiceHistory);

/**
 * @swagger
 * /api/services/history/{id}:
 *   delete:
 *     summary: Elimina un registro del historial (solo Admin)
 *     tags: [Service History]
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
 *         description: Registro eliminado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido
 *       404:
 *         description: Registro no encontrado
 */
router.delete('/history/:id', authenticate, authorize('ADMIN'), deleteServiceHistory);

export const serviceHistoryRoutes = router;
