import { Vehicle, CreateVehicleRequest, UpdateVehicleRequest } from '../types/vehicle';
import { PrismaClient, VehicleStatus } from '@prisma/client';
import prisma from '../config/prisma'; // Usar la instancia compartida

class VehicleModel {

  // Función helper para normalizar patentes
  private normalizarPatente(patente: string): string {
    if (!patente.includes('-')) {
      return patente.slice(0, 3) + '-' + patente.slice(3);
    }
    return patente;
  }

  // Validar si una patente ya existe (excluyendo un ID específico para edición)
  async validarPatenteUnica(patente: string, excludeId?: number): Promise<boolean> {
    const patenteNormalizada = this.normalizarPatente(patente);
    const existingVehicle = await this.findByLicense(patenteNormalizada);
    
    // Si no hay vehículo existente, la patente es única
    if (!existingVehicle) return true;
    
    // Si estamos editando y es el mismo vehículo, la patente es única
    if (excludeId && existingVehicle.id === excludeId) return true;
    
    // La patente ya existe
    return false;
  }

  // CREATE - Crear vehículo
  async create(vehicleData: CreateVehicleRequest, userId: number): Promise<Vehicle> {
    // Normalizar patente
    const patenteNormalizada = this.normalizarPatente(vehicleData.license);
    
    const newVehicle = await prisma.vehicle.create({
      data: {
        ...vehicleData,
        license: patenteNormalizada, // Usar patente normalizada
        color: vehicleData.color || null, // Manejar color vacío
        userId,
        status: VehicleStatus.ACTIVE,
      },
    });
    return newVehicle;
  }

  // READ - Obtener vehículos de un usuario específico
  async findByUserId(userId: number, status?: VehicleStatus): Promise<Vehicle[]> {
    const whereClause: any = { userId: userId };
    if (status) {
      whereClause.status = status;
    }
    
    const vehicles = await prisma.vehicle.findMany({
      where: whereClause,
    });
    return vehicles;
  }

  // READ - Obtener vehículo por ID
  async findById(id: number): Promise<Vehicle | null> {
    return await prisma.vehicle.findUnique({
      where: { id: id },
    });
  }

  // READ - Obtener vehículo por patente
  async findByLicense(license: string): Promise<Vehicle | null> {
    return await prisma.vehicle.findUnique({
      where: { license: license },
    });
  }

  // UPDATE - Actualizar vehículo
  async update(id: number, updateData: any): Promise<any> {
    const dataToUpdate: any = {};
    for (const key of Object.keys(updateData)) {
      let value = updateData[key];
      // Normalizar patente si corresponde
      if (key === 'license' && value) {
        value = this.normalizarPatente(value);
      }
      if (key === 'year' && value !== undefined && value !== null && value !== '') {
        value = Number(value);
      }
      if (value !== undefined && value !== null) {
        dataToUpdate[key] = value;
      }
    }
    dataToUpdate.updatedAt = new Date();

    return prisma.vehicle.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  // DELETE - Eliminar vehículo
  async delete(id: number): Promise<boolean> {
    try {
      await prisma.vehicle.delete({
        where: { id: id },
      });
      return true;
    } catch (error) {
      console.error("Error al eliminar vehículo:", error);
      return false;
    }
  }

  // READ - Obtener todos los vehículos (para admin)
  async findAll(): Promise<Vehicle[]> {
    return await prisma.vehicle.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true }
        }
      }
    });
  }

  // Verificar si un vehículo pertenece a un usuario
  async belongsToUser(vehicleId: number, userId: number): Promise<boolean> {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });
    return vehicle ? vehicle.userId === userId : false;
  }
}

export default new VehicleModel();


