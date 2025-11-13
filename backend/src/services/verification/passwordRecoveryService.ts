import { PrismaClient } from '@prisma/client';
import { TokenService } from './tokenService';
import { Logger } from '../../utils/logger';

export enum PasswordRecoveryError {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  TOKEN_ALREADY_USED = 'TOKEN_ALREADY_USED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED'
}

export interface PasswordRecoveryResult {
  success: boolean;
  error?: PasswordRecoveryError;
  message: string;
}

export class PasswordRecoveryService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Genera y guarda un token de recuperación de contraseña
   */
  async generatePasswordRecoveryToken(email: string): Promise<PasswordRecoveryResult> {
    Logger.info('Generando token de recuperación de contraseña', { email });

    // Buscar usuario por email
    const user = await this.prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      Logger.warn('Usuario no encontrado para recuperación', { email });
      return {
        success: false,
        error: PasswordRecoveryError.USER_NOT_FOUND,
        message: 'No existe una cuenta con este email'
      };
    }

    // Verificar que el email esté verificado
    if (!user.isVerified) {
      Logger.warn('Intento de recuperación con email no verificado', { userId: user.id, email });
      return {
        success: false,
        error: PasswordRecoveryError.EMAIL_NOT_VERIFIED,
        message: 'Debes verificar tu email antes de poder recuperar tu contraseña'
      };
    }

    // Generar token de recuperación (expira en 1 hora)
    const tokenData = TokenService.generatePasswordRecoveryToken();

    // Guardar token de recuperación
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: tokenData.token,
        passwordResetExpires: tokenData.expiresAt
      }
    });

    Logger.info('Token de recuperación generado exitosamente', {
      userId: user.id,
      email: user.email,
      expiresAt: tokenData.expiresAt
    });

    return {
      success: true,
      message: 'Token de recuperación generado exitosamente'
    };
  }

  /**
   * Valida un token de recuperación de contraseña
   */
  async validatePasswordRecoveryToken(token: string): Promise<PasswordRecoveryResult> {
    Logger.info('Validando token de recuperación', { tokenLength: token.length });

    // Buscar usuario por token
    const user = await this.prisma.user.findFirst({
      where: { passwordResetToken: token }
    });

    if (!user) {
      Logger.warn('Token de recuperación no encontrado', { tokenLength: token.length });
      return {
        success: false,
        error: PasswordRecoveryError.TOKEN_INVALID,
        message: 'Token de recuperación no encontrado'
      };
    }

    Logger.info('Usuario encontrado para recuperación', { userId: user.id, email: user.email });

    // Validar token usando TokenService
    if (!user.passwordResetExpires) {
      return {
        success: false,
        error: PasswordRecoveryError.TOKEN_INVALID,
        message: 'Token de recuperación inválido'
      };
    }

    const validation = TokenService.validateToken(token, user.passwordResetExpires);
    
    if (!validation.isValid) {
      Logger.warn('Token de recuperación inválido', { 
        userId: user.id, 
        email: user.email,
        error: validation.error
      });
      
      return {
        success: false,
        error: validation.error === 'Token expirado' ? PasswordRecoveryError.TOKEN_EXPIRED : PasswordRecoveryError.TOKEN_INVALID,
        message: validation.error || 'Token de recuperación inválido'
      };
    }

    return {
      success: true,
      message: 'Token de recuperación válido'
    };
  }

  /**
   * Resetea la contraseña usando un token válido
   */
  async resetPassword(token: string, newPassword: string): Promise<PasswordRecoveryResult> {
    Logger.info('Iniciando reset de contraseña', { tokenLength: token.length });

    // Validar token primero
    const validationResult = await this.validatePasswordRecoveryToken(token);
    if (!validationResult.success) {
      return validationResult;
    }

    // Buscar usuario por token
    const user = await this.prisma.user.findFirst({
      where: { passwordResetToken: token }
    });

    if (!user) {
      return {
        success: false,
        error: PasswordRecoveryError.TOKEN_INVALID,
        message: 'Token de recuperación no encontrado'
      };
    }

    // Hashear nueva contraseña
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña y limpiar token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null
      }
    });

    Logger.info('Contraseña reseteada exitosamente', { userId: user.id, email: user.email });

    return {
      success: true,
      message: 'Contraseña actualizada exitosamente'
    };
  }

  /**
   * Limpia tokens de recuperación expirados
   */
  async cleanupExpiredRecoveryTokens(): Promise<void> {
    await this.prisma.user.updateMany({
      where: {
        passwordResetExpires: {
          lt: new Date()
        }
      },
      data: {
        passwordResetToken: null,
        passwordResetExpires: null
      }
    });
  }
}
