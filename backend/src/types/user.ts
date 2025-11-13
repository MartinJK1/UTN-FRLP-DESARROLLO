import { User, UserRole } from "@prisma/client";

// Re-exportar el tipo User de Prisma para mantener compatibilidad
export { User, UserRole };
  
  export interface LoginRequest {
    email: string;
    password: string;
  }
  
  export interface LoginResponse {
    token: string;
    user: User;
  }
  
  export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    phone: string;
  }
  
  export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
  }
  
  export interface UpdateProfileRequest {
    name?: string;
    email?: string;
    phone?: string | null; // Cambiado a string | null
    role?: UserRole; // Añadido campo role para actualización
    isActive?: boolean; // Añadido campo isActive
  }