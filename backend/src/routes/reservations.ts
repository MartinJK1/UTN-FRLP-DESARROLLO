import { Router } from 'express';
import {
  createReservation,
  getUserReservations,
  getReservation,
  updateReservation,
  cancelReservation,
  getReservationsByDate,
  getReservationsByMonth,
  getAllReservations,
  deleteReservation,
  getMyReservations
} from '../controllers/reservationController';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/reservations:
 *   post:
 *     summary: Crea una nueva reserva
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               vehicleId:
 *                 type: string
 *               serviceId:
 *                 type: string
 *               reservationDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Reserva creada
 *       400:
 *         description: Error en la solicitud
 *       401:
 *         description: No autorizado
 */
router.post('/', authenticate, authorize('ADMIN', 'USER'), createReservation);

/**
 * @swagger
 * /api/reservations:
 *   get:
 *     summary: Obtiene las reservas del usuario o todas las reservas (solo Admin)
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: ID del usuario para filtrar las reservas (solo Admin)
 *     responses:
 *       200:
 *         description: Lista de reservas
 *       401:
 *         description: No autorizado
 */
router.get('/', authenticate, authorize('ADMIN', 'USER'), (req, res) => {
  const userRole = req.user!.role;

  if (userRole === 'ADMIN') {
    return getAllReservations(req, res);
  } else {
    req.params.userId = req.user!.id.toString();
    return getUserReservations(req, res);
  }
});

/**
 * @swagger
 * /api/reservations/user/{userId}:
 *   get:
 *     summary: Obtiene las reservas de un usuario específico (solo Admin)
 *     tags: [Reservations]
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
 *         description: Lista de reservas del usuario
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido
 */
router.get('/user/:userId', authenticate, authorize('ADMIN'), getUserReservations);

/**
 * @swagger
 * /api/reservations/date/{date}:
 *   get:
 *     summary: Obtiene las reservas por fecha
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Lista de reservas para la fecha
 *       401:
 *         description: No autorizado
 */
router.get('/date/:date', authenticate, authorize('ADMIN', 'USER'), getReservationsByDate);

/**
 * @swagger
 * /api/reservations/month/{year}/{month}:
 *   get:
 *     summary: Obtiene las reservas por mes
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: month
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de reservas para el mes
 *       401:
 *         description: No autorizado
 */
router.get('/month/:year/:month', authenticate, authorize('ADMIN', 'USER'), getReservationsByMonth);

/**
 * @swagger
 * /api/reservations/my:
 *   get:
 *     summary: Obtiene las reservas del usuario autenticado
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de reservas del usuario
 *       401:
 *         description: No autorizado
 */
router.get('/my', authenticate, getMyReservations);

/**
 * @swagger
 * /api/reservations/{id}/cancel:
 *   patch:
 *     summary: Cancela una reserva
 *     tags: [Reservations]
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
 *         description: Reserva cancelada
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Reserva no encontrada
 */
router.patch('/:id/cancel', authenticate, authorize('ADMIN', 'USER'), cancelReservation);

/**
 * @swagger
 * /api/reservations/{id}:
 *   get:
 *     summary: Obtiene una reserva específica
 *     tags: [Reservations]
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
 *         description: Datos de la reserva
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Reserva no encontrada
 */
router.get('/:id', authenticate, authorize('ADMIN', 'USER'), getReservation);

/**
 * @swagger
 * /api/reservations/{id}:
 *   put:
 *     summary: Actualiza una reserva
 *     tags: [Reservations]
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
 *               vehicleId:
 *                 type: string
 *               serviceId:
 *                 type: string
 *               reservationDate:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reserva actualizada
 *       400:
 *         description: Error en la solicitud
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Reserva no encontrada
 */
router.put('/:id', authenticate, authorize('ADMIN', 'USER'), updateReservation);

/**
 * @swagger
 * /api/reservations/{id}:
 *   delete:
 *     summary: Elimina una reserva (solo Admin)
 *     tags: [Reservations]
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
 *         description: Reserva eliminada
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido
 *       404:
 *         description: Reserva no encontrada
 */
router.delete('/:id', authenticate, authorize('ADMIN'), deleteReservation);

export const reservationRoutes = router;

