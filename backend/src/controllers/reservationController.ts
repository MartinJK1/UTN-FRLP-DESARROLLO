import { Request, Response } from 'express';
import ReservationModel from '../models/Reservation';
import VehicleModel from '../models/Vehicle';
import { CreateReservationRequest, UpdateReservationRequest } from '../types/reservation';
import { ReservationStatus } from '@prisma/client'; // Importar el enum de Prisma
import { PrismaClient } from '@prisma/client'; // Importar PrismaClient para la nueva función

const prisma = new PrismaClient(); // Instanciar PrismaClient

// CREATE - Crear reserva
export const createReservation = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id; // Del middleware de autenticación
    const reservationData: CreateReservationRequest = req.body;

    // Validaciones básicas
    if (!reservationData.vehicleId || !reservationData.serviceId || !reservationData.date || !reservationData.time) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos (vehicleId, serviceId, date, time)'
      });
    }

    // Validar que el vehículo pertenezca al usuario
    const vehicle = await VehicleModel.findById(reservationData.vehicleId);
    if (!vehicle || vehicle.userId !== userId) {
      return res.status(400).json({
        success: false,
        message: 'Vehículo no encontrado o no pertenece al usuario'
      });
    }

    // Validar formato de fecha (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(reservationData.date)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de fecha inválido. Use YYYY-MM-DD'
      });
    }

    // Validar formato de hora (HH:MM)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(reservationData.time)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de hora inválido. Use HH:MM'
      });
    }

    // Validar que la fecha no sea en el pasado
    // Crear fecha de reserva en zona horaria local (Argentina UTC-3)
    const [year, month, day] = reservationData.date.split('-').map(Number);
    const reservationDate = new Date(year, month - 1, day); // mes - 1 porque Date usa 0-indexado
    reservationDate.setHours(0, 0, 0, 0);
    
    // Crear fecha de hoy en zona horaria local
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Convertir reservationDate y today a UTC para una comparación consistente
    const reservationDateUTC = new Date(Date.UTC(year, month - 1, day));
    const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));

    // Validación ajustada para fechas pasadas
    if (reservationDateUTC.getTime() <= todayUTC.getTime()) {
      return res.status(400).json({
        success: false,
        message: 'No se pueden hacer reservas en fechas pasadas'
      });
    }

    // Validar disponibilidad del horario
    const isAvailable = await ReservationModel.isTimeSlotAvailable(reservationData.date, reservationData.time);
    if (!isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Este horario no está disponible'
      });
    }

    // Crear la reserva
    const newReservation = await ReservationModel.create(reservationData, userId);

    res.status(201).json({
      success: true,
      message: 'Reserva creada exitosamente',
      data: {
        reservation: newReservation
      }
    });

  } catch (error) {
    console.error('Error al crear reserva:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// READ - Obtener reservas del usuario
export const getUserReservations = async (req: Request, res: Response) => {
  try {
    const userIdFromParams = parseInt(req.params.userId); // Obtener userId de los parámetros de la ruta
    const userRole = req.user!.role; // Obtener el rol del usuario autenticado
    const authenticatedUserId = req.user!.id; // Obtener el ID del usuario autenticado

    // Un usuario normal solo puede ver sus propias reservas
    if (userRole === 'USER' && userIdFromParams !== authenticatedUserId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para ver las reservas de otro usuario.'
      });
    }

    // Un administrador puede ver las reservas de cualquier usuario si se especifica userId
    // Si es un administrador y se está pidiendo una lista por userId (no /reservations/all)
    let reservations;
    if (userRole === 'ADMIN' && userIdFromParams) {
      reservations = await ReservationModel.findByUserId(userIdFromParams);
    } else {
      // Para usuarios normales o admin pidiendo sus propias reservas (cuando no hay /all)
      reservations = await ReservationModel.findByUserId(authenticatedUserId);
    }

    res.json({
      success: true,
      data: { reservations }
    });

  } catch (error) {
    console.error(' Error en getUserReservations:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Nueva función para obtener TODAS las reservas (solo para administradores)
export const getAllReservations = async (req: Request, res: Response) => {
  try {
    const userRole = req.user!.role;

    if (userRole !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para ver todas las reservas.'
      });
    }

    const reservations = await ReservationModel.findAll();

    res.json({
      success: true,
      data: { reservations }
    });

  } catch (error) {
    console.error(' Error en getAllReservations:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// READ - Obtener reserva específica
export const getReservation = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const reservationId = parseInt(req.params.id);

    const reservation = await ReservationModel.findById(reservationId);
    
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada'
      });
    }

    // Verificar que la reserva pertenezca al usuario o que el usuario sea ADMIN
    if (reservation.userId !== userId && req.user!.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para ver esta reserva'
      });
    }

    res.json({
      success: true,
      data: {
        reservation
      }
    });

  } catch (error) {
    console.error('Error al obtener reserva:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// UPDATE - Actualizar reserva
export const updateReservation = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const reservationId = parseInt(req.params.id);
    const updateData: UpdateReservationRequest = req.body;

    // Verificar que la reserva exista y pertenezca al usuario
    const existingReservation = await ReservationModel.findById(reservationId);
    if (!existingReservation) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada'
      });
    }

    // Verificar que la reserva pertenezca al usuario o que el usuario sea ADMIN
    if (existingReservation.userId !== userId && req.user!.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para modificar esta reserva'
      });
    }

    // Si se está cambiando fecha/hora, validar disponibilidad
    if ((updateData.date || updateData.time) && existingReservation.status !== ReservationStatus.PENDING) {
      return res.status(400).json({
        success: false,
        message: 'Solo se pueden modificar reservas pendientes'
      });
    }

    if (updateData.date || updateData.time) {
      const newDate = updateData.date || existingReservation.date;
      const newTime = updateData.time || existingReservation.time;
      
      const isAvailable = await ReservationModel.isTimeSlotAvailable(newDate, newTime, reservationId);
      if (!isAvailable) {
        return res.status(400).json({
          success: false,
          message: 'El nuevo horario no está disponible'
        });
      }
    }

    // Actualizar la reserva
    const updatedReservation = await ReservationModel.update(reservationId, updateData);

    if (!updatedReservation) {
      return res.status(500).json({
        success: false,
        message: 'Error al actualizar la reserva'
      });
    }

    res.json({
      success: true,
      message: 'Reserva actualizada exitosamente',
      data: {
        reservation: updatedReservation
      }
    });

  } catch (error) {
    console.error('Error al actualizar reserva:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// DELETE - Cancelar reserva
export const cancelReservation = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const reservationId = parseInt(req.params.id);

    // Verificar que la reserva exista y pertenezca al usuario
    const existingReservation = await ReservationModel.findById(reservationId);
    if (!existingReservation) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada'
      });
    }

    //solo el propietario o un admin pueden cancelar
    const userRole = req.user!.role;
    if (existingReservation.userId !== userId && userRole !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para cancelar esta reserva'
      });
    }

    // Solo se pueden cancelar reservas pendientes o confirmadas
    if (existingReservation.status === ReservationStatus.COMPLETED) {
      return res.status(400).json({
        success: false,
        message: 'No se pueden cancelar reservas completadas'
      });
    }

    // Cambiar estado a cancelada
    const updatedReservation = await ReservationModel.updateStatus(reservationId, ReservationStatus.CANCELLED);

    res.json({
      success: true,
      message: 'Reserva cancelada exitosamente',
      data: {
        reservation: updatedReservation
      }
    });

  } catch (error) {
    console.error('Error al cancelar reserva:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// READ - Obtener reservas por fecha (para ver disponibilidad)
export const getReservationsByDate = async (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    
    // Validar formato de fecha
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de fecha inválido. Use YYYY-MM-DD'
      });
    }

    const reservations = await ReservationModel.findByDate(date);

    res.json({
      success: true,
      data: reservations
    });

  } catch (error) {
    console.error(' Error en getReservationsByDate:', error); // Añadido para imprimir el error completo
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: (error as Error).message // Opcional: enviar el mensaje de error al cliente
    });
  }
};

// READ - Obtener reservas por mes
export const getReservationsByMonth = async (req: Request, res: Response) => {
  try {
    const { year, month } = req.params;
    const reservations = await ReservationModel.findByMonth(parseInt(year), parseInt(month));

    res.json({
      success: true,
      data: reservations
    });

  } catch (error) {
    console.error(' Error en getReservationsByMonth:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor',
      error: (error as Error).message
    });
  }
};

// DELETE - Eliminar reserva (solo para administradores)
export const deleteReservation = async (req: Request, res: Response) => {
  try {
    const userRole = req.user!.role;

    if (userRole !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para eliminar reservas'
      });
    }

    const reservationId = parseInt(req.params.id);

    // Verificar que la reserva exista
    const existingReservation = await ReservationModel.findById(reservationId);
    if (!existingReservation) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada'
      });
    }

    // Eliminar la reserva
    await ReservationModel.delete(reservationId);

    res.json({
      success: true,
      message: 'Reserva eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar reserva:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Función para obtener las reservas del usuario autenticado
export const getMyReservations = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'No autorizado' });
  }

  try {
    const reservations = await prisma.reservation.findMany({
      where: {
        userId: userId,
      },
      include: {
        user: { select: { name: true, email: true } },
        vehicle: { select: { license: true, model: true } },
        service: { select: { name: true } },
        serviceHistory: { 
          select: { 
            observaciones: true, 
            resultado: true, 
            fechaServicio: true, 
            mecanico: true 
          } 
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    res.status(200).json({
      message: 'Tus reservas obtenidas exitosamente',
      data: { reservations },
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: 'Error al obtener tus reservas', error: error.message });
    } else {
      res.status(500).json({ message: 'Ocurrió un error desconocido' });
    }
  }
};

