import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middlewares/validation.middleware';
import { loginSchema, registerSchema, changePasswordSchema, verifyEmailSchema, resendVerificationSchema } from '../validations/auth.validation';
import { authenticate, requireUnverified } from '../middlewares/auth.middleware';

// Crear un router para las rutas de autenticación
const router = Router();

// RUTAS PÚBLICAS - No requieren autenticación
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registra un nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *                 description: Número de teléfono (opcional)
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *       400:
 *         description: Error en la solicitud
 */
router.post('/register', validate(registerSchema), authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Inicia sesión de un usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/login', validate(loginSchema), authController.login);

/**
 * @swagger
 * /api/auth/verify-email/{token}:
 *   get:
 *     summary: Verifica el email de un usuario
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Email verificado
 *       400:
 *         description: Token inválido o expirado
 */
router.get('/verify-email/:token', validate(verifyEmailSchema, 'params'), authController.verifyEmail);

// RUTAS PROTEGIDAS - Requieren autenticación
/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Cambia la contraseña del usuario autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contraseña cambiada
 *       400:
 *         description: Error en la solicitud
 *       401:
 *         description: No autorizado
 */
router.post('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);

/**
 * @swagger
 * /api/auth/resend-verification:
 *   post:
 *     summary: Reenvía el email de verificación
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Email reenviado
 *       401:
 *         description: No autorizado
 */
router.post('/resend-verification', authenticate, requireUnverified, validate(resendVerificationSchema), authController.resendVerificationEmail);

/**
 * @swagger
 * /api/auth/verification-status:
 *   get:
 *     summary: Obtiene el estado de verificación del usuario
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estado de verificación
 *       401:
 *         description: No autorizado
 */
router.get('/verification-status', authenticate, authController.getVerificationStatus);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Cierra la sesión del usuario
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesión cerrada
 *       401:
 *         description: No autorizado
 */
router.post('/logout', authenticate, authController.logout);

// RUTAS PARA RECUPERACIÓN DE CONTRASEÑA
/**
 * @swagger
 * /api/auth/request-password-recovery:
 *   post:
 *     summary: Solicita la recuperación de contraseña
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email de recuperación enviado
 *       404:
 *         description: Usuario no encontrado
 */
router.post('/request-password-recovery', authController.requestPasswordRecovery);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Resetea la contraseña con un token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contraseña reseteada
 *       400:
 *         description: Token inválido o expirado
 */
router.post('/reset-password', authController.resetPassword);

/**
 * @swagger
 * /api/auth/validate-recovery-token/{token}:
 *   get:
 *     summary: Valida un token de recuperación de contraseña
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Token válido
 *       400:
 *         description: Token inválido o expirado
 */
router.get('/validate-recovery-token/:token', authController.validateRecoveryToken);

// POST /api/auth/change-password - Cambiar contraseña desde perfil (requiere autenticación)
router.post('/change-password', authenticate, authController.changePassword);

// Exportar el router para usarlo en app.ts
export const authRoutes = router;