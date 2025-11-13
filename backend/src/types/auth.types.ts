// Tipos para autenticación
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    user: {
      id: number;
      email: string;
      name: string;
      phone?: string | null;
      role: 'USER' | 'ADMIN' | 'MECHANIC';
    };
    token: string;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role?: 'USER' | 'ADMIN' | 'MECHANIC';
}

export interface RegisterResponse {
  success: boolean;
  data: {
    user: {
      id: number;
      email: string;
      name: string;
      phone?: string | null;
      role: 'USER' | 'ADMIN' | 'MECHANIC';
    };
    token: string | null; // Puede ser null si requiere verificación de email
  };
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

// Tipo para el usuario en el token JWT
export interface JWTPayload {
  id: number;
  email: string;
  role: 'USER' | 'ADMIN' | 'MECHANIC';
}
