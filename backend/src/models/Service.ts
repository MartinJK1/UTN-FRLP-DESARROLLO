import { Service, CreateServiceRequest, UpdateServiceRequest } from '../types/service';
import { PrismaClient, ServiceCategory as PrismaServiceCategory } from '@prisma/client';
import prisma from '../config/prisma';

// Modelo para el CRUD de Servicios
// Maneja la lógica de datos y operaciones CRUD para servicios
class ServiceModel {
  // Array en memoria para almacenar servicios (temporal hasta implementar base de datos)
  // private services: Service[] = [];
  // private nextId = 1;

  constructor() {
    // No necesitamos crear servicios de ejemplo en memoria si usamos una DB
    // this.createExampleServices();
  }

  // ========================================
  // OPERACIONES CRUD BÁSICAS
  // ========================================

  // CREATE - Crear un nuevo servicio
  async create(serviceData: CreateServiceRequest): Promise<Service> {
    // Validar datos requeridos (la base de datos también hará esto si se configura NOT NULL)
    if (!serviceData.name || !serviceData.description || !serviceData.category ||
      serviceData.price <= 0 || serviceData.duration <= 0) {
      throw new Error('Todos los campos son requeridos y deben ser válidos');
    }

    const newService = await prisma.service.create({
      data: {
        ...serviceData,
        category: serviceData.category, // Asegurarse de que el enum se mapea correctamente
        isActive: true,
      },
    });

    console.log(`✅ Servicio creado: ${newService.name} (ID: ${newService.id})`);
    return newService;
  }

  // READ - Obtener todos los servicios (con filtro opcional)
  async findAll(onlyActive: boolean = false): Promise<Service[]> {
    const whereClause = onlyActive ? { isActive: true } : {};
    const services = await prisma.service.findMany({
      where: whereClause,
    });
    // Mapear de PrismaServiceCategory a TypeServiceCategory si es necesario para la interfaz de salida
    return services as Service[];
  }

  // READ - Obtener servicio por ID
  async findById(id: number): Promise<Service | null> {
    const service = await prisma.service.findUnique({
      where: { id: id },
    });
    return service as Service | null;
  }

  // READ - Obtener servicios por categoría
  async findByCategory(category: PrismaServiceCategory): Promise<Service[]> {
    const services = await prisma.service.findMany({
      where: {
        category: category, // Ahora category es PrismaServiceCategory directamente
        isActive: true,
      },
    });
    return services as Service[];
  }

  // READ - Buscar servicios por nombre o descripción
  async searchServices(searchTerm: string): Promise<Service[]> {
    const services = await prisma.service.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
    });
    return services as Service[];
  }

  // UPDATE - Actualizar servicio existente
  async update(id: number, updateData: UpdateServiceRequest): Promise<Service | null> {
    // Validar precio y duración si se proporcionan
    if (updateData.price !== undefined && updateData.price <= 0) {
      throw new Error('El precio debe ser mayor a 0');
    }
    if (updateData.duration !== undefined && updateData.duration <= 0) {
      throw new Error('La duración debe ser mayor a 0');
    }

    try {
      const updatedService = await prisma.service.update({
        where: { id: id },
        data: {
          ...updateData,
          category: updateData.category, // category ya es PrismaServiceCategory si se proporciona
          updatedAt: new Date(),
        },
      });
      console.log(`✅ Servicio actualizado: ${updatedService.name} (ID: ${id})`);
      return updatedService as Service;
    } catch (error) {
      console.error("Error al actualizar servicio:", error);
      return null;
    }
  }

  // DELETE - Eliminación lógica (soft delete)
  async delete(id: number): Promise<boolean> {
    try {
      await prisma.service.update({
        where: { id: id },
        data: {
          isActive: false,
          updatedAt: new Date(),
        },
      });
      console.log(`✅ Servicio desactivado (soft delete): (ID: ${id})`);
      return true;
    } catch (error) {
      console.error("Error al eliminar lógicamente el servicio:", error);
      return false;
    }
  }

  // DELETE - Eliminación física (hard delete)
  async hardDelete(id: number): Promise<boolean> {
    try {
      await prisma.service.delete({
        where: { id: id },
      });
      console.log(`🗑️ Servicio eliminado permanentemente (ID: ${id})`);
      return true;
    } catch (error) {
      console.error("Error al eliminar permanentemente el servicio:", error);
      return false;
    }
  }

  // ========================================
  // OPERACIONES ESPECIALIZADAS
  // ========================================

  // Obtener estadísticas básicas de servicios
  async getServiceStats(): Promise<{
    total: number;
    active: number;
    byCategory: Record<string, number>;
    averagePrice: number;
  }> {
    const total = await prisma.service.count();
    const active = await prisma.service.count({
      where: { isActive: true },
    });

    const services = await prisma.service.findMany({
      select: { category: true, price: true },
    });

    const byCategory: Record<string, number> = {};
    services.forEach(service => {
      byCategory[service.category] = (byCategory[service.category] || 0) + 1;
    });

    const totalPrice = services.reduce((sum, service) => sum + service.price, 0);
    const averagePrice = total > 0 ? totalPrice / total : 0;

    return {
      total,
      active,
      byCategory,
      averagePrice: Math.round(averagePrice * 100) / 100
    };
  }

  // ========================================
  // DATOS DE EJEMPLO PARA TESTING
  // ========================================

  // private createExampleServices(): void {
  //   const exampleServices: CreateServiceRequest[] = [
  //     {
  //       name: 'Cambio de Aceite',
  //       description: 'Cambio completo de aceite del motor con filtro incluido',
  //       category: 'mantenimiento',
  //       price: 25000,
  //       duration: 45
  //     },
  //     {
  //       name: 'Cambio de Filtros',
  //       description: 'Cambio de filtros de aire, combustible y aceite',
  //       category: 'mantenimiento',
  //       price: 18000,
  //       duration: 30
  //     },
  //     {
  //       name: 'Diagnóstico Computarizado',
  //       description: 'Análisis completo del sistema electrónico del vehículo',
  //       category: 'diagnostico',
  //       price: 15000,
  //       duration: 60
  //     },
  //     {
  //       name: 'Limpieza de Inyectores',
  //       description: 'Limpieza y calibración de inyectores de combustible',
  //       category: 'reparacion',
  //       price: 35000,
  //       duration: 90
  //     },
  //     {
  //       name: 'Lavado de Motor',
  //       description: 'Limpieza profunda del compartimento del motor',
  //       category: 'limpieza',
  //       price: 12000,
  //       duration: 45
  //     }
  //   ];

  //   // Crear servicios de ejemplo
  //   exampleServices.forEach(serviceData => {
  //     try {
  //       this.create(serviceData);
  //     } catch (error) {
  //       console.error('Error al crear servicio de ejemplo:', error);
  //     }
  //   });

  //   console.log(` ${exampleServices.length} servicios de ejemplo creados`);
  // }
}

// Exportar una instancia única del modelo (Singleton pattern)
export default new ServiceModel();
