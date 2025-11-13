import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Controlador para el historial de servicios
// Maneja la lógica de negocio para el registro y consulta del historial de servicios

// ========================================
// OPERACIONES CRUD PARA HISTORIAL
// ========================================

// CREATE - Registrar un nuevo servicio en el historial
export const createServiceHistory = async (req: Request, res: Response) => {
  try {
    const {
      userId,
      vehicleId,
      serviceId,
      reservationId,
      resultado,
      observaciones,
      repuestos,
      kilometraje,
      mecanico,
      registradoPor
    } = req.body;

    // Validar campos requeridos
    if (!userId || !vehicleId || !serviceId || !resultado || !observaciones || !kilometraje || !mecanico || !registradoPor) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos: userId, vehicleId, serviceId, resultado, observaciones, kilometraje, mecanico, registradoPor'
      });
    }

    // Validar que el kilometraje sea un número positivo
    if (kilometraje < 0) {
      return res.status(400).json({
        success: false,
        message: 'El kilometraje debe ser un número positivo'
      });
    }

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar que el vehículo existe
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: parseInt(vehicleId) }
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehículo no encontrado'
      });
    }

    // Verificar que el servicio existe
    const service = await prisma.service.findUnique({
      where: { id: parseInt(serviceId) }
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Servicio no encontrado'
      });
    }

    // Verificar que la reserva existe (si se proporciona)
    if (reservationId) {
      const reservation = await prisma.reservation.findUnique({
        where: { id: parseInt(reservationId) }
      });

      if (!reservation) {
        return res.status(404).json({
          success: false,
          message: 'Reserva no encontrada'
        });
      }
    }

    // Crear el registro en el historial
    const serviceHistory = await prisma.serviceHistory.create({
      data: {
        userId: parseInt(userId),
        vehicleId: parseInt(vehicleId),
        serviceId: parseInt(serviceId),
        reservationId: reservationId ? parseInt(reservationId) : null,
        resultado,
        observaciones,
        repuestos: repuestos || null,
        kilometraje: parseInt(kilometraje),
        mecanico,
        registradoPor
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        vehicle: {
          select: {
            id: true,
            license: true,
            brand: true,
            model: true,
            year: true
          }
        },
        service: {
          select: {
            id: true,
            name: true,
            description: true,
            category: true
          }
        },
        reservation: {
          select: {
            id: true,
            date: true,
            time: true,
            status: true
          }
        }
      }
    });

    // Respuesta exitosa
    res.status(201).json({
      success: true,
      message: 'Servicio registrado exitosamente en el historial',
      data: serviceHistory
    });

  } catch (error) {
    console.error('Error al crear historial de servicio:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al registrar el servicio'
    });
  }
};

// READ - Obtener historial de servicios por vehículo (patente)
export const getServiceHistoryByVehicle = async (req: Request, res: Response) => {
  try {
    const { patente } = req.query;

    if (!patente) {
      return res.status(400).json({
        success: false,
        message: 'Patente del vehículo es requerida'
      });
    }

    // Buscar el vehículo por patente
    const vehicle = await prisma.vehicle.findUnique({
      where: { license: patente.toString().toUpperCase() }
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehículo no encontrado'
      });
    }

    // Obtener el historial de servicios del vehículo
    const serviceHistory = await prisma.serviceHistory.findMany({
      where: {
        vehicleId: vehicle.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        vehicle: {
          select: {
            id: true,
            license: true,
            brand: true,
            model: true,
            year: true
          }
        },
        service: {
          select: {
            id: true,
            name: true,
            description: true,
            category: true
          }
        },
        reservation: {
          select: {
            id: true,
            date: true,
            time: true,
            status: true
          }
        }
      },
      orderBy: {
        fechaServicio: 'desc'
      }
    });

    // Transformar los datos para el frontend
    const historialTransformado = serviceHistory.map(historial => ({
      id: historial.id,
      fecha: historial.fechaServicio.toISOString().split('T')[0],
      hora: historial.fechaServicio.toTimeString().split(' ')[0].substring(0, 5),
      servicio: historial.service.name,
      resultado: historial.resultado,
      observaciones: historial.observaciones,
      repuestos: historial.repuestos,
      kilometraje: historial.kilometraje,
      mecanico: historial.mecanico,
      registradoPor: historial.registradoPor,
      cliente: historial.user.name,
      vehiculo: {
        patente: historial.vehicle.license,
        marca: historial.vehicle.brand,
        modelo: historial.vehicle.model,
        año: historial.vehicle.year
      },
      reserva: historial.reservation ? {
        fecha: historial.reservation.date,
        hora: historial.reservation.time,
        estado: historial.reservation.status
      } : null
    }));

    res.json({
      success: true,
      data: historialTransformado,
      total: historialTransformado.length,
      vehiculo: {
        patente: vehicle.license,
        marca: vehicle.brand,
        modelo: vehicle.model,
        año: vehicle.year
      }
    });

  } catch (error) {
    console.error('Error al obtener historial por vehículo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener el historial'
    });
  }
};

// READ - Obtener historial de servicios por usuario
export const getServiceHistoryByUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'ID de usuario es requerido'
      });
    }

    // Obtener el historial de servicios del usuario
    const serviceHistory = await prisma.serviceHistory.findMany({
      where: {
        userId: parseInt(userId)
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        vehicle: {
          select: {
            id: true,
            license: true,
            brand: true,
            model: true,
            year: true
          }
        },
        service: {
          select: {
            id: true,
            name: true,
            description: true,
            category: true
          }
        },
        reservation: {
          select: {
            id: true,
            date: true,
            time: true,
            status: true
          }
        }
      },
      orderBy: {
        fechaServicio: 'desc'
      }
    });

    res.json({
      success: true,
      data: serviceHistory,
      total: serviceHistory.length
    });

  } catch (error) {
    console.error('Error al obtener historial por usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener el historial'
    });
  }
};

// READ - Obtener todo el historial de servicios (solo para ADMIN)
export const getAllServiceHistory = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50, fechaDesde, fechaHasta, resultado } = req.query;

    // Construir filtros
    const where: any = {};

    if (fechaDesde && fechaHasta) {
      where.fechaServicio = {
        gte: new Date(fechaDesde.toString()),
        lte: new Date(fechaHasta.toString())
      };
    }

    if (resultado) {
      where.resultado = resultado.toString();
    }

    // Calcular offset para paginación
    const offset = (parseInt(page.toString()) - 1) * parseInt(limit.toString());

    // Obtener el historial con paginación
    const [serviceHistory, total] = await Promise.all([
      prisma.serviceHistory.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          vehicle: {
            select: {
              id: true,
              license: true,
              brand: true,
              model: true,
              year: true
            }
          },
          service: {
            select: {
              id: true,
              name: true,
              description: true,
              category: true
            }
          },
          reservation: {
            select: {
              id: true,
              date: true,
              time: true,
              status: true
            }
          }
        },
        orderBy: {
          fechaServicio: 'desc'
        },
        skip: offset,
        take: parseInt(limit.toString())
      }),
      prisma.serviceHistory.count({ where })
    ]);

    res.json({
      success: true,
      data: serviceHistory,
      pagination: {
        page: parseInt(page.toString()),
        limit: parseInt(limit.toString()),
        total,
        totalPages: Math.ceil(total / parseInt(limit.toString()))
      }
    });

  } catch (error) {
    console.error('Error al obtener todo el historial:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener el historial'
    });
  }
};

// READ - Obtener estadísticas del historial
export const getServiceHistoryStats = async (req: Request, res: Response) => {
  try {
    const { patente, fechaDesde, fechaHasta } = req.query;

    // Construir filtros
    const where: any = {};

    if (patente) {
      const vehicle = await prisma.vehicle.findUnique({
        where: { license: patente.toString().toUpperCase() }
      });
      if (vehicle) {
        where.vehicleId = vehicle.id;
      }
    }

    if (fechaDesde && fechaHasta) {
      where.fechaServicio = {
        gte: new Date(fechaDesde.toString()),
        lte: new Date(fechaHasta.toString())
      };
    }

    // Obtener estadísticas
    const [
      totalServicios,
      serviciosCompletados,
      serviciosPendientes,
      serviciosCancelados,
      serviciosConRepuestos
    ] = await Promise.all([
      prisma.serviceHistory.count({ where }),
      prisma.serviceHistory.count({ where: { ...where, resultado: 'Completado' } }),
      prisma.serviceHistory.count({ where: { ...where, resultado: 'Pendiente' } }),
      prisma.serviceHistory.count({ where: { ...where, resultado: 'Cancelado' } }),
      prisma.serviceHistory.count({ where: { ...where, repuestos: { not: null } } })
    ]);

    res.json({
      success: true,
      data: {
        totalServicios,
        serviciosCompletados,
        serviciosPendientes,
        serviciosCancelados,
        serviciosConRepuestos,
        porcentajeCompletados: totalServicios > 0 ? Math.round((serviciosCompletados / totalServicios) * 100) : 0
      }
    });

  } catch (error) {
    console.error('Error al obtener estadísticas del historial:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener estadísticas'
    });
  }
};

// UPDATE - Actualizar registro del historial
export const updateServiceHistory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID del historial es requerido'
      });
    }

    // Validar que el registro existe
    const existingRecord = await prisma.serviceHistory.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingRecord) {
      return res.status(404).json({
        success: false,
        message: 'Registro del historial no encontrado'
      });
    }

    // Actualizar el registro
    const updatedRecord = await prisma.serviceHistory.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        vehicle: {
          select: {
            id: true,
            license: true,
            brand: true,
            model: true,
            year: true
          }
        },
        service: {
          select: {
            id: true,
            name: true,
            description: true,
            category: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Registro del historial actualizado exitosamente',
      data: updatedRecord
    });

  } catch (error) {
    console.error('Error al actualizar historial:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al actualizar el historial'
    });
  }
};

// DELETE - Eliminar registro del historial
export const deleteServiceHistory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID del historial es requerido'
      });
    }

    // Verificar que el registro existe
    const existingRecord = await prisma.serviceHistory.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingRecord) {
      return res.status(404).json({
        success: false,
        message: 'Registro del historial no encontrado'
      });
    }

    // Eliminar el registro
    await prisma.serviceHistory.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Registro del historial eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar historial:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al eliminar el historial'
    });
  }
};
