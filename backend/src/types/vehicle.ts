import { Vehicle, VehicleStatus } from "@prisma/client";

// Re-exportar el tipo Vehicle de Prisma para mantener compatibilidad
export { Vehicle, VehicleStatus };

export interface CreateVehicleRequest {
  license: string;
  brand: string;
  model: string;
  year: number;
  color: string;
}

export interface UpdateVehicleRequest {
  license?: string;
  brand?: string;
  model?: string;
  year?: number;
  color?: string;
  status?: VehicleStatus;  // Estado del vehículo (cambiado a VehicleStatus)
}

export interface VehicleResponse {
  success: boolean;
  data?: Vehicle | Vehicle[];
  message?: string;
}


