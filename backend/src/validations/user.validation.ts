import { z } from 'zod';

// Schema para crear usuario
export const createUserSchema = z.object({
  email: z.string().email('Email inválido').toLowerCase().trim(),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  name: z.string().min(2, 'Mínimo 2 caracteres').max(50, 'Máximo 50 caracteres').trim(),
  phone: z.string().min(10, 'Mínimo 10 caracteres').max(15, 'Máximo 15 caracteres').optional(),
  role: z.enum(['USER', 'ADMIN']).optional().default('USER')
});

// Schema para actualizar un usuario
export const updateUserSchema = createUserSchema.partial();

// Schema para que un usuario actualice su PROPIO perfil
export const userProfileUpdateSchema = z.object({
  email: z.string().email('Email inválido').toLowerCase().trim().optional(),
  name: z.string().min(2, 'Mínimo 2 caracteres').max(50, 'Máximo 50 caracteres').trim().optional(),
  phone: z.string().min(10, 'Mínimo 10 caracteres').max(15, 'Máximo 15 caracteres').optional(),
});

// Schema para validar ID de usuario en params
export const userIdSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID debe ser un número').transform(Number)
});
