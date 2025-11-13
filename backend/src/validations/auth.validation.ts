import { z } from 'zod';

// Schema para login
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida')
});

// Schema para registro
export const registerSchema = z.object({
  email: z.string().email('Email inválido').toLowerCase().trim(),
  password: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  name: z.string()
    .min(2, 'Mínimo 2 caracteres')
    .max(50, 'Máximo 50 caracteres')
    .trim(),
  phone: z.string()
    .min(10, 'Mínimo 10 caracteres')
    .max(15, 'Máximo 15 caracteres')
    .optional(),
  role: z.enum(['USER', 'ADMIN']).optional().default('USER')
});

// Schema para cambio de contraseña
export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Contraseña actual requerida'),
  newPassword: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número')
});

// Schema para verificación de email
export const verifyEmailSchema = z.object({
  token: z.string()
    .min(64, 'Token de verificación inválido')
    .max(64, 'Token de verificación inválido')
    .regex(/^[a-f0-9]{64}$/, 'Formato de token inválido')
});

// Schema para reenvío de verificación (no requiere datos adicionales)
export const resendVerificationSchema = z.object({});