import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { LoginRequest, LoginResponse } from '../types/auth.types';

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.login(req.body);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  // En JWT, el logout se maneja principalmente en el cliente
  res.json({
    success: true,
    message: 'Sesión cerrada exitosamente'
  });
}

// Endpoints para verificación de email

export async function verifyEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const { token } = req.params;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token de verificación requerido'
      });
    }

    const result = await authService.verifyEmail(token);
    
    if (result.success) {
      // Redirigir al frontend con mensaje de éxito
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const redirectUrl = `${frontendUrl}/login?verified=true&message=${encodeURIComponent(result.message)}`;
      return res.redirect(redirectUrl);
    } else {
      // Redirigir al frontend con mensaje de error
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const redirectUrl = `${frontendUrl}/login?verified=false&error=${encodeURIComponent(result.message)}`;
      return res.redirect(redirectUrl);
    }
  } catch (error) {
    next(error);
  }
}

export async function resendVerificationEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado'
      });
    }

    const result = await authService.resendVerificationEmail(userId);
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.message
      });
    }
  } catch (error) {
    next(error);
  }
}

export async function getVerificationStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'No autenticado'
      });
    }

    const result = await authService.getVerificationStatus(userId);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

// Endpoints para recuperación de contraseña

export async function requestPasswordRecovery(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email requerido'
      });
    }

    const result = await authService.requestPasswordRecovery(email);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Si el email existe y está verificado, recibirás un enlace de recuperación'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.message
      });
    }
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Token y nueva contraseña requeridos'
      });
    }

    const result = await authService.resetPassword(token, newPassword);
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.message
      });
    }
  } catch (error) {
    next(error);
  }
}

export async function validateRecoveryToken(req: Request, res: Response, next: NextFunction) {
  try {
    const { token } = req.params;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token requerido'
      });
    }

    const passwordRecoveryService = new (await import('../services/verification/passwordRecoveryService')).PasswordRecoveryService(
      await import('../config/prisma').then(m => m.default)
    );
    
    const result = await passwordRecoveryService.validatePasswordRecoveryToken(token);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Token válido'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.message
      });
    }
  } catch (error) {
    next(error);
  }
}

export async function changePassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
    }
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Contraseña actual y nueva contraseña requeridas'
      });
    }

    const result = await authService.changePassword(userId, currentPassword, newPassword);
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.message
      });
    }
  } catch (error) {
    next(error);
  }
}