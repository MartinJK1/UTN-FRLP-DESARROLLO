import { PrismaClient } from '@prisma/client';
import { TokenService, VerificationToken } from './tokenService';
import { Logger } from '../../utils/logger';

export enum VerificationError {
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  TOKEN_ALREADY_USED = 'TOKEN_ALREADY_USED',
  USER_ALREADY_VERIFIED = 'USER_ALREADY_VERIFIED',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED'
}

export interface VerificationResult {
  success: boolean;
  error?: VerificationError;
  message: string;
}

export class VerificationService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Genera y guarda un token de verificación para un usuario
   */
  async generateVerificationToken(userId: number): Promise<VerificationToken> {
    Logger.info('Generando token de verificación', { userId });

    const tokenData = TokenService.generateVerificationToken();

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        verificationToken: tokenData.token,
        verificationExpires: tokenData.expiresAt
      }
    });

    Logger.info('Token de verificación generado exitosamente', {
      userId,
      tokenLength: tokenData.token.length,
      expiresAt: tokenData.expiresAt
    });

    return tokenData;
  }

  /**
   * Verifica un token y activa la cuenta del usuario
   */
  async verifyEmail(token: string): Promise<VerificationResult> {
    Logger.info('Iniciando verificación de email', { tokenLength: token.length });

    // Validar formato del token
    if (!TokenService.isValidTokenFormat(token)) {
      Logger.warn('Token de verificación con formato inválido', { tokenLength: token.length });
      return {
        success: false,
        error: VerificationError.TOKEN_INVALID,
        message: 'Token de verificación inválido'
      };
    }

    // Buscar usuario por token
    const user = await this.prisma.user.findFirst({
      where: { verificationToken: token }
    });

    if (!user) {
      Logger.warn('Token de verificación no encontrado', { tokenLength: token.length });
      return {
        success: false,
        error: VerificationError.TOKEN_INVALID,
        message: 'Token de verificación no encontrado'
      };
    }

    Logger.info('Usuario encontrado para verificación', { userId: user.id, email: user.email });

    // Verificar si ya está verificado
    if (user.isVerified) {
      Logger.warn('Intento de verificar email ya verificado', { userId: user.id, email: user.email });
      return {
        success: false,
        error: VerificationError.USER_ALREADY_VERIFIED,
        message: 'El email ya ha sido verificado'
      };
    }

    // Verificar si el token está expirado
    if (!user.verificationExpires || TokenService.isTokenExpired(user.verificationExpires)) {
      Logger.warn('Token de verificación expirado', { 
        userId: user.id, 
        email: user.email,
        expiresAt: user.verificationExpires 
      });
      return {
        success: false,
        error: VerificationError.TOKEN_EXPIRED,
        message: 'El token de verificación ha expirado'
      };
    }

    // Activar la cuenta
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
        verificationExpires: null
      }
    });

    Logger.info('Email verificado exitosamente', { userId: user.id, email: user.email });

    return {
      success: true,
      message: 'Email verificado exitosamente'
    };
  }

  /**
   * Reenvía el email de verificación
   */
  async resendVerificationEmail(userId: number): Promise<VerificationResult> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return {
        success: false,
        error: VerificationError.USER_NOT_FOUND,
        message: 'Usuario no encontrado'
      };
    }

    if (user.isVerified) {
      return {
        success: false,
        error: VerificationError.USER_ALREADY_VERIFIED,
        message: 'El email ya ha sido verificado'
      };
    }

    // Generar nuevo token
    const tokenData = await this.generateVerificationToken(userId);

    return {
      success: true,
      message: 'Email de verificación reenviado'
    };
  }

  /**
   * Limpia tokens expirados
   */
  async cleanupExpiredTokens(): Promise<void> {
    await this.prisma.user.updateMany({
      where: {
        verificationExpires: {
          lt: new Date()
        }
      },
      data: {
        verificationToken: null,
        verificationExpires: null
      }
    });
  }

  /**
   * Verifica si un usuario está verificado
   */
  async isUserVerified(userId: number): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isVerified: true }
    });

    return user?.isVerified || false;
  }
}
