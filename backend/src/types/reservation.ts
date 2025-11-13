import { Reservation, ReservationStatus } from "@prisma/client";

// Re-exportar el tipo Reservation de Prisma para mantener compatibilidad
export { Reservation, ReservationStatus };

export interface CreateReservationRequest {
  vehicleId: number;
  serviceId: number; // Cambiado de serviceType a serviceId
  date: string;
  time: string;
  notes?: string | null; // Cambiado a string | null para coincidir con Prisma
}

export interface UpdateReservationRequest {
  vehicleId?: number;
  serviceId?: number; // Cambiado de serviceType a serviceId
  date?: string;
  time?: string;
  status?: ReservationStatus; // Cambiado a ReservationStatus
  notes?: string | null; // Cambiado a string | null para coincidir con Prisma
}

export interface ReservationResponse {
  id: number;
  userId: number;
  vehicleId: number;
  serviceId: number; // Cambiado de serviceType a serviceId
  date: string;
  time: string;
  status: ReservationStatus; // Cambiado a ReservationStatus
  notes?: string | null; // Cambiado a string | null para coincidir con Prisma
  createdAt: Date;
  updatedAt: Date;
  // Datos relacionados (para respuestas completas)
  vehicle?: {
    license: string;
    brand: string;
    model: string;
  };
  service?: {
    name: string;
    description: string;
    price: number;
  };
}

