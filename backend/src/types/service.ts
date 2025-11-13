import { ServiceCategory as PrismaServiceCategory } from '@prisma/client';

// Interfaces para el CRUD de Servicios del Lubricentro
// Define los tipos para gestionar los servicios ofrecidos

// ========================================
// INTERFACES PRINCIPALES
// ========================================

// Interface para la entidad Service
export interface Service {
  id: number;
  name: string;
  description: string;
  category: PrismaServiceCategory; // Cambiado a PrismaServiceCategory
  price: number;
  duration: number;        // Duración en minutos
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Categorías de servicios disponibles (Ahora usamos el enum de Prisma directamente o lo mapeamos si es necesario)
// export type ServiceCategory = 'mantenimiento' | 'reparacion' | 'diagnostico' | 'limpieza' | 'otros';

// ========================================
// INTERFACES PARA REQUEST/RESPONSE
// ========================================

// Interface para crear un nuevo servicio
export interface CreateServiceRequest {
  name: string;
  description: string;
  category: PrismaServiceCategory; // Cambiado a PrismaServiceCategory
  price: number;
  duration: number;
}

// Interface para actualizar un servicio existente
export interface UpdateServiceRequest {
  name?: string;
  description?: string;
  category?: PrismaServiceCategory; // Cambiado a PrismaServiceCategory
  price?: number;
  duration?: number;
  isActive?: boolean;
}

// ========================================
// INTERFACES PARA FILTROS Y BÚSQUEDAS
// ========================================

// Interface para filtros de búsqueda
export interface ServiceFilters {
  category?: PrismaServiceCategory; // Cambiado a PrismaServiceCategory
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

// Interface para respuesta de búsqueda
export interface ServiceSearchResponse {
  services: Service[];
  total: number;
  filters: ServiceFilters;
}

// ========================================
// INTERFACES PARA ESTADÍSTICAS
// ========================================

// Interface para estadísticas de servicio
export interface ServiceStats {
  serviceId: number;
  serviceName: string;
  totalReservations: number;
  totalRevenue: number;
  averageRating?: number;
  popularity: 'bajo' | 'medio' | 'alto';
}

// Interface para categorías con conteo
export interface CategoryStats {
  category: PrismaServiceCategory; // Cambiado a PrismaServiceCategory
  count: number;
  averagePrice: number;
  totalServices: number;
}
