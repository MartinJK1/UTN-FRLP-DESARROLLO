
import { z } from 'zod';
import { VehicleStatus } from '@prisma/client';

export const createVehicleSchema = z.object({
  license: z.string().min(3, 'La patente debe tener al menos 3 caracteres').max(10, 'La patente debe tener como máximo 10 caracteres'),
  brand: z.string().min(2, 'La marca debe tener al menos 2 caracteres'),
  model: z.string().min(1, 'El modelo debe tener al menos 1 carácter'),
  year: z.number().int().min(1900, 'El año debe ser posterior a 1900').max(new Date().getFullYear() + 1, 'El año no puede ser en el futuro'),
  color: z.string().optional(),
  status: z.nativeEnum(VehicleStatus).default(VehicleStatus.ACTIVE).optional(),
  userId: z.number().int().positive('El ID de usuario debe ser un entero positivo'),
});

export const updateVehicleSchema = z.object({
  license: z.string().min(3, 'La patente debe tener al menos 3 caracteres').max(10, 'La patente debe tener como máximo 10 caracteres').optional(),
  brand: z.string().min(2, 'La marca debe tener al menos 2 caracteres').optional(),
  model: z.string().min(1, 'El modelo debe tener al menos 1 carácter').optional(),
  year: z.number().int().min(1900, 'El año debe ser posterior a 1900').max(new Date().getFullYear() + 1, 'El año no puede ser en el futuro').optional(),
  color: z.string().optional(),
  status: z.nativeEnum(VehicleStatus).optional(),
  userId: z.number().int().positive('El ID de usuario debe ser un entero positivo').optional(),
});

export const vehicleIdSchema = z.object({
  id: z.string().regex(/^\d+$/, 'El ID debe ser un número').transform(Number),
});
