import { Router } from 'express';
import {
  getSystemStats,
  getSystemInfo
} from '../controllers/adminController';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate, authorize('ADMIN'));

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Obtiene estadísticas del sistema (solo Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas del sistema
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido
 */
router.get('/stats', getSystemStats);

/**
 * @swagger
 * /api/admin/system:
 *   get:
 *     summary: Obtiene información del sistema (solo Admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Información del sistema
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido
 */
router.get('/system', getSystemInfo);

export default router;

