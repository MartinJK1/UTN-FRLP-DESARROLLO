import crypto from 'crypto';

export interface VerificationToken {
  token: string;
  expiresAt: Date;
}

export class TokenService {
  private static readonly TOKEN_LENGTH = 32;
  private static readonly EXPIRATION_HOURS = 24;

  /**
   * Genera un token único para verificación de email
   */
  static generateVerificationToken(): VerificationToken {
    const token = crypto.randomBytes(this.TOKEN_LENGTH).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + this.EXPIRATION_HOURS);

    return {
      token,
      expiresAt
    };
  }

  /**
   * Genera un token de recuperación de contraseña (expira en 1 hora)
   */
  static generatePasswordRecoveryToken(): VerificationToken {
    const token = crypto.randomBytes(this.TOKEN_LENGTH).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hora para recuperación

    return {
      token,
      expiresAt
    };
  }

  /**
   * Valida si un token está expirado
   */
  static isTokenExpired(expiresAt: Date): boolean {
    return new Date() > expiresAt;
  }

  /**
   * Valida el formato del token
   */
  static isValidTokenFormat(token: string): boolean {
    return /^[a-f0-9]{64}$/.test(token);
  }

  /**
   * Valida completamente un token (formato + expiración)
   */
  static validateToken(token: string, expiresAt: Date): { isValid: boolean; error?: string } {
    if (!this.isValidTokenFormat(token)) {
      return {
        isValid: false,
        error: 'Formato de token inválido'
      };
    }

    if (this.isTokenExpired(expiresAt)) {
      return {
        isValid: false,
        error: 'Token expirado'
      };
    }

    return {
      isValid: true
    };
  }

  /**
   * Genera un token de reenvío (más corto, para rate limiting)
   */
  static generateResendToken(): string {
    return crypto.randomBytes(16).toString('hex');
  }
}
