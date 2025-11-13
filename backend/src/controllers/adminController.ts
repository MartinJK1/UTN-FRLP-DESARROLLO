import { Request, Response } from 'express';
import UserModel from '../models/User';
import VehicleModel from '../models/Vehicle';
import ReservationModel from '../models/Reservation';
import ServiceModel from '../models/Service';
import { SystemStats } from '../types/admin';
import { UserRole, VehicleStatus, ReservationStatus } from '@prisma/client';

// ========================================
// ESTADÍSTICAS DEL SISTEMA
// ========================================

// READ - Obtener estadísticas generales del sistema
export const getSystemStats = async (req: Request, res: Response) => {
  try {
    // Obtener todos los datos del sistema
    const allUsers = await UserModel.findAll();
    const allVehicles = await VehicleModel.findAll();
    const allReservations = await ReservationModel.findAll();
    const allServices = await ServiceModel.findAll();
    
    // Calcular estadísticas de usuarios
    const totalUsers = allUsers.length;
    const activeUsers = allUsers.filter(user => user.isActive).length;
    const usersByRole: Record<UserRole, number> = { [UserRole.ADMIN]: 0, [UserRole.MECHANIC]: 0, [UserRole.USER]: 0 };
    allUsers.forEach(user => {
      if (usersByRole[user.role] !== undefined) {
        usersByRole[user.role]++;
      }
    });
    
    // Calcular estadísticas de vehículos
    const totalVehicles = allVehicles.length;
    const activeVehicles = allVehicles.filter(vehicle => vehicle.status === VehicleStatus.ACTIVE).length;
    
    // Calcular estadísticas de reservas
    const totalReservations = allReservations.length;
    const reservationsByStatus: Record<ReservationStatus, number> = {
      [ReservationStatus.PENDING]: allReservations.filter(r => r.status === ReservationStatus.PENDING).length,
      [ReservationStatus.CONFIRMED]: allReservations.filter(r => r.status === ReservationStatus.CONFIRMED).length,
      [ReservationStatus.COMPLETED]: allReservations.filter(r => r.status === ReservationStatus.COMPLETED).length,
      [ReservationStatus.CANCELLED]: allReservations.filter(r => r.status === ReservationStatus.CANCELLED).length
    };
    
    // Calcular estadísticas de servicios
    const totalServices = allServices.length;
    const activeServices = allServices.filter(service => service.isActive).length;
    
    // Construir objeto de estadísticas
    const systemStats: SystemStats = {
      // Usuarios
      totalUsers,
      activeUsers,
      usersByRole,
      
      // Vehículos
      totalVehicles,
      activeVehicles,
      
      // Reservas
      totalReservations,
      reservationsByStatus,
      reservationsByMonth: [], 
      
      // Servicios
      totalServices,
      activeServices,
      topServices: [], 
      
      // Financiero
      totalRevenue: 0, 
      averageReservationValue: 0, 
      
      // Sistema
      serverUptime: process.uptime().toString(),
      lastBackup: new Date().toISOString(), 
      systemVersion: '1.0.0'
    };
    
    // Respuesta exitosa
    res.json({
      success: true,
      data: {
        stats: systemStats
      }
    });

  } catch (error) {
    console.error('Error al obtener estadísticas del sistema:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// ========================================
// OPERACIONES DEL SISTEMA
// ========================================

// READ - Obtener información del sistema
export const getSystemInfo = async (req: Request, res: Response) => {
  try {
    const systemInfo = {
      name: 'API del Lubricentro Renault',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      platform: process.platform,
      nodeVersion: process.version,
      timestamp: new Date().toISOString()
    };
    
    // Respuesta exitosa
    res.json({
      success: true,
      data: {
        system: systemInfo
      }
    });

  } catch (error) {
    console.error('Error al obtener información del sistema:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

