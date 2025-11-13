import { Router } from 'express';
import {
  createVehicle,
  getUserVehicles,
  getVehicle,
  updateVehicle,
  deleteVehicle,
  getAllVehicles
} from '../controllers/vehicleController';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { createVehicleSchema, updateVehicleSchema, vehicleIdSchema } from '../validations/vehicleValidation';

const router = Router();

/**
 * @swagger
 * /api/vehicles:
 *   post:
 *     summary: Crea un nuevo vehículo
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               brand:
 *                 type: string
 *               model:
 *                 type: string
 *               year:
 *                 type: integer
 *               plate:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       201:
 *         description: Vehículo creado
 *       400:
 *         description: Error en la solicitud
 *       401:
 *         description: No autorizado
 */
router.post('/', authenticate, authorize('ADMIN', 'USER'), validate(createVehicleSchema), createVehicle);

/**
 * @swagger
 * /api/vehicles/all:
 *   get:
 *     summary: Obtiene todos los vehículos (solo Admin)
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de todos los vehículos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido
 */
router.get('/all', authenticate, authorize('ADMIN'), getAllVehicles);

/**
 * @swagger
 * /api/vehicles:
 *   get:
 *     summary: Obtiene los vehículos del usuario autenticado
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de vehículos del usuario
 *       401:
 *         description: No autorizado
 */
router.get('/', authenticate, authorize('ADMIN', 'USER'), getUserVehicles);

/**
 * @swagger
 * /api/vehicles/{id}:
 *   get:
 *     summary: Obtiene un vehículo específico
 *     tags: [Vehicles]
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
 *         description: Datos del vehículo
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Vehículo no encontrado
 */
router.get('/:id', authenticate, authorize('ADMIN', 'USER'), validate(vehicleIdSchema, 'params'), getVehicle);

/**
 * @swagger
 * /api/vehicles/{id}:
 *   put:
 *     summary: Actualiza un vehículo
 *     tags: [Vehicles]
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
 *               brand:
 *                 type: string
 *               model:
 *                 type: string
 *               year:
 *                 type: integer
 *               plate:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Vehículo actualizado
 *       400:
 *         description: Error en la solicitud
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Vehículo no encontrado
 */
router.put('/:id', authenticate, authorize('ADMIN', 'USER'), validate(vehicleIdSchema, 'params'), validate(updateVehicleSchema), updateVehicle);

/**
 * @swagger
 * /api/vehicles/{id}:
 *   delete:
 *     summary: Elimina un vehículo
 *     tags: [Vehicles]
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
 *         description: Vehículo eliminado
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Vehículo no encontrado
 */
router.delete('/:id', authenticate, authorize('ADMIN', 'USER'), validate(vehicleIdSchema, 'params'), deleteVehicle);

export const vehicleRoutes = router;


