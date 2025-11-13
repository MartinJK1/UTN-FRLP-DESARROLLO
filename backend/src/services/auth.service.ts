import prisma from '../config/prisma';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, JWTPayload } from '../types/auth.types';
import { VerificationService } from './verification/verificationService';
import { BrevoService } from './email/brevoService';
import { PasswordRecoveryService } from './verification/passwordRecoveryService';
import { Logger } from '../utils/logger';

export async function login(data: LoginRequest): Promise<LoginResponse['data']> {
  Logger.info('Intento de login', { email: data.email });

  // 1. Buscar usuario
  const user = await prisma.user.findUnique({
    where: { email: data.email }
  });

  if (!user) {
    Logger.warn('Login fallido: usuario no encontrado', { email: data.email });
    throw new Error('Credenciales inválidas');
  }

  // 2. Verificar password
  const validPassword = await bcrypt.compare(data.password, user.password);
  if (!validPassword) {
    Logger.warn('Login fallido: contraseña incorrecta', { userId: user.id, email: user.email });
    throw new Error('Credenciales inválidas');
  }

  // 3. Verificar si el email está verificado
  if (!user.isVerified) {
    Logger.warn('Login fallido: email no verificado', { userId: user.id, email: user.email });
    throw new Error('Debes verificar tu email antes de iniciar sesión');
  }

  // 4. Verificar si la cuenta está activa
  if (!user.isActive) {
    Logger.warn('Login fallido: cuenta suspendida', { userId: user.id, email: user.email });
    throw new Error('Tu cuenta ha sido suspendida. Contacta al administrador');
  }

  // 5. Generar JWT
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    Logger.error('JWT_SECRET no está configurado');
    throw new Error('JWT_SECRET no está configurado');
  }
  
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role } as JWTPayload,
    jwtSecret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '2h' } as SignOptions
  );

  Logger.info('Login exitoso', { userId: user.id, email: user.email, role: user.role });

  // 6. Retornar sin password
  const { password, ...userWithoutPassword } = user;
  return {
    user: userWithoutPassword,
    token
  };
}

export async function register(data: RegisterRequest): Promise<RegisterResponse['data']> {
  // 1. Verificar si el usuario ya existe
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email }
  });

  if (existingUser) {
    throw new Error('Email ya registrado');
  }

  // 2. Hashear contraseña
  const hashedPassword = await bcrypt.hash(data.password, 10);

  // 3. Crear usuario (con isVerified: false por defecto)
  const newUser = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
      phone: data.phone,
      role: data.role || 'USER',
      isVerified: false // Usuario no verificado inicialmente
    }
  });

  // 4. Generar token de verificación y enviar email
  try {
    const verificationService = new VerificationService(prisma);
    const brevoService = new BrevoService();
    
    // Generar token de verificación
    const tokenData = await verificationService.generateVerificationToken(newUser.id);
    
    // Crear link de verificación (directo al backend)
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
    const verificationLink = `${backendUrl}/api/auth/verify-email/${tokenData.token}`;
    
    // Enviar email de verificación
    await brevoService.sendVerificationEmail({
      to: newUser.email,
      name: newUser.name,
      verificationLink
    });
    
  } catch (error) {
    console.error('Error enviando email de verificación:', error);
    // No lanzamos error aquí para no interrumpir el registro
    // El usuario puede solicitar reenvío después
  }

  // 5. Retornar sin password y sin token (usuario debe verificar email)
  const { password, ...userWithoutPassword } = newUser;
  return {
    user: userWithoutPassword,
    token: null // No se genera token hasta verificar email
  };
}

// Funciones auxiliares para verificación de email

export async function verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
  const verificationService = new VerificationService(prisma);
  const result = await verificationService.verifyEmail(token);
  
  return {
    success: result.success,
    message: result.message
  };
}

export async function resendVerificationEmail(userId: number): Promise<{ success: boolean; message: string }> {
  const verificationService = new VerificationService(prisma);
  const brevoService = new BrevoService();
  
  try {
    // Generar nuevo token
    const result = await verificationService.resendVerificationEmail(userId);
    
    if (result.success) {
      // Obtener usuario para enviar email
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });
      
      if (user && user.verificationToken) {
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
        const verificationLink = `${backendUrl}/api/auth/verify-email/${user.verificationToken}`;
        
        await brevoService.sendVerificationEmail({
          to: user.email,
          name: user.name,
          verificationLink
        });
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error reenviando email de verificación:', error);
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
}

export async function getVerificationStatus(userId: number): Promise<{ isVerified: boolean; message: string }> {
  const verificationService = new VerificationService(prisma);
  const isVerified = await verificationService.isUserVerified(userId);
  
  return {
    isVerified,
    message: isVerified ? 'Email verificado' : 'Email pendiente de verificación'
  };
}

// Funciones para recuperación de contraseña

export async function requestPasswordRecovery(email: string): Promise<{ success: boolean; message: string }> {
  Logger.info('Solicitud de recuperación de contraseña', { email });

  const passwordRecoveryService = new PasswordRecoveryService(prisma);
  const brevoService = new BrevoService();
  
  try {
    // Generar token de recuperación
    const result = await passwordRecoveryService.generatePasswordRecoveryToken(email);
    
    if (result.success) {
      // Obtener usuario para enviar email
      const user = await prisma.user.findUnique({
        where: { email }
      });
      
      if (user && user.passwordResetToken) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const recoveryLink = `${frontendUrl}/reset-password/${user.passwordResetToken}`;
        
        await brevoService.sendPasswordRecoveryEmail({
          to: user.email,
          name: user.name,
          recoveryLink
        });
      }
    }
    
    return result;
  } catch (error) {
    Logger.error('Error en recuperación de contraseña', { email, error: error instanceof Error ? error.message : 'Error desconocido' });
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
}

export async function resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  Logger.info('Reset de contraseña desde email', { tokenLength: token.length });

  const passwordRecoveryService = new PasswordRecoveryService(prisma);
  
  try {
    const result = await passwordRecoveryService.resetPassword(token, newPassword);
    return result;
  } catch (error) {
    Logger.error('Error en reset de contraseña', { tokenLength: token.length, error: error instanceof Error ? error.message : 'Error desconocido' });
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
}

export async function changePassword(userId: number, currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  Logger.info('Cambio de contraseña desde perfil', { userId });

  try {
    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return {
        success: false,
        message: 'Usuario no encontrado'
      };
    }

    // Validar contraseña actual
    const bcrypt = require('bcryptjs');
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isCurrentPasswordValid) {
      Logger.warn('Contraseña actual incorrecta en cambio desde perfil', { userId });
      return {
        success: false,
        message: 'La contraseña actual es incorrecta'
      };
    }

    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword
      }
    });

    Logger.info('Contraseña cambiada exitosamente desde perfil', { userId });

    return {
      success: true,
      message: 'Contraseña actualizada exitosamente'
    };
  } catch (error) {
    Logger.error('Error en cambio de contraseña desde perfil', { userId, error: error instanceof Error ? error.message : 'Error desconocido' });
    return {
      success: false,
      message: 'Error interno del servidor'
    };
  }
}
