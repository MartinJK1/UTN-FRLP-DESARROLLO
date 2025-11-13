import { createReservation } from '../controllers/reservationController';
import prisma from '../config/prisma';
import { Request, Response } from 'express';

// Mock de Prisma para evitar interacciones reales con la base de datos
jest.mock('../config/prisma', () => ({
  reservation: {
    create: jest.fn(),
    findMany: jest.fn().mockResolvedValue([]), // Mockear findMany para devolver un array vacío
  },
  vehicle: {
    findUnique: jest.fn(),
  },
}));

describe('ReservationController - createReservation', () => {
  test('debe crear una reserva exitosamente', async () => {
    // ARRANGE: Preparar datos de prueba
    const mockRequest = {
      user: { id: 1 }, // Usuario autenticado
      body: {
        vehicleId: 1,
        serviceId: 2,
        date: '2025-12-30', // Fecha futura
        time: '10:00',
      },
    } as Request;

    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    const mockVehicle = { id: 1, userId: 1 }; // Vehículo que pertenece al usuario
    const mockReservation = {
      id: 1,
      vehicleId: 1,
      serviceId: 2,
      date: '2025-12-30',
      time: '10:00',
      userId: 1,
      status: 'PENDING', // Propiedad adicional
      notes: undefined, // Propiedad adicional
    };

    // Mockear las funciones de Prisma
    (prisma.vehicle.findUnique as jest.Mock).mockResolvedValue(mockVehicle);
    (prisma.reservation.create as jest.Mock).mockResolvedValue(mockReservation);

    // ACT: Ejecutar la función
    await createReservation(mockRequest, mockResponse);

    // ASSERT: Verificar el resultado
    expect(prisma.vehicle.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });
    expect(prisma.reservation.create).toHaveBeenCalledWith({
      data: {
        vehicleId: 1,
        serviceId: 2,
        date: '2025-12-30',
        time: '10:00',
        userId: 1,
        status: 'PENDING', // Propiedad adicional
        notes: undefined, // Propiedad adicional
      },
    });
    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: true,
      message: 'Reserva creada exitosamente',
      data: { reservation: mockReservation },
    });
  });

  test('debe retornar error si el vehículo no pertenece al usuario', async () => {
    // ARRANGE: Preparar datos de prueba
    const mockRequest = {
      user: { id: 1 }, // Usuario autenticado
      body: {
        vehicleId: 2, // Vehículo que no pertenece al usuario
        serviceId: 2,
        date: '2025-12-30',
        time: '10:00',
      },
    } as Request;

    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    // Mockear las funciones de Prisma
    (prisma.vehicle.findUnique as jest.Mock).mockResolvedValue(null); // Vehículo no encontrado

    // ACT: Ejecutar la función
    await createReservation(mockRequest, mockResponse);

    // ASSERT: Verificar el resultado
    expect(prisma.vehicle.findUnique).toHaveBeenCalledWith({
      where: { id: 2 },
    });
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: 'Vehículo no encontrado o no pertenece al usuario',
    });
  });

  test('debe retornar error si la fecha es inválida (pasada)', async () => {
    // ARRANGE: Preparar datos de prueba
    const mockRequest = {
      user: { id: 1 },
      body: {
        vehicleId: 1,
        serviceId: 2,
        date: '2025-11-11', // Fecha ajustada a un día antes de hoy
        time: '10:00',
      },
    } as Request;

    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    const mockVehicle = { id: 1, userId: 1 }; // Vehículo que pertenece al usuario

    // Mockear las funciones de Prisma
    (prisma.vehicle.findUnique as jest.Mock).mockResolvedValue(mockVehicle);

    // ACT: Ejecutar la función
    await createReservation(mockRequest, mockResponse);

    // ASSERT: Verificar el resultado
    expect(prisma.vehicle.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: 'No se pueden hacer reservas en fechas pasadas',
    });
  });
});