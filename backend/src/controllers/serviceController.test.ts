import { createService } from './serviceController';
import { Request, Response } from 'express';
import ServiceModel from '../models/Service';
import { ServiceCategory } from '@prisma/client';

describe('ServiceController - createService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should successfully create a service', async () => {
    const mockRequest = {
      body: {
        name: 'Cambio de Aceite',
        description: 'Cambiar el aceite del motor',
        category: ServiceCategory.MANTENIMIENTO,
        price: 50,
        duration: 30,
      },
    } as Request;

    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    jest.spyOn(ServiceModel, 'create').mockResolvedValue({
      id: 1,
      name: 'Cambio de Aceite',
      description: 'Cambiar el aceite del motor',
      category: ServiceCategory.MANTENIMIENTO,
      price: 50,
      duration: 30,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await createService(mockRequest, mockResponse);

    expect(ServiceModel.create).toHaveBeenCalledWith({
      name: 'Cambio de Aceite',
      description: 'Cambiar el aceite del motor',
      category: ServiceCategory.MANTENIMIENTO,
      price: 50,
      duration: 30,
    });

    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: true,
      message: 'Servicio creado exitosamente',
      data: {
        service: {
          id: 1,
          name: 'Cambio de Aceite',
          description: 'Cambiar el aceite del motor',
          category: ServiceCategory.MANTENIMIENTO,
          price: 50,
          duration: 30,
          isActive: true,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      },
    });
  });
});