import { createVehicle } from './vehicleController';
import prisma from '../config/prisma';
import VehicleModel from '../models/Vehicle';

describe('VehicleController - createVehicle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should successfully create a vehicle', async () => {
    const mockRequest = {
      user: { id: 1 },
      body: {
        license: 'ABC-123',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2023,
        color: 'Red',
      },
    } as any;

    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    jest.spyOn(VehicleModel, 'validarPatenteUnica').mockResolvedValue(true);

    prisma.vehicle.create = jest.fn().mockResolvedValue({
      id: 1,
      license: 'ABC-123',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2023,
      color: 'Red',
      userId: 1,
      status: 'ACTIVE',
    });

    await createVehicle(mockRequest, mockResponse);

    expect(VehicleModel.validarPatenteUnica).toHaveBeenCalledWith('ABC-123');
    expect(prisma.vehicle.create).toHaveBeenCalledWith({
      data: {
        license: 'ABC-123',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2023,
        color: 'Red',
        userId: 1,
        status: 'ACTIVE',
      },
    });

    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: true,
      data: {
        id: 1,
        license: 'ABC-123',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2023,
        color: 'Red',
        userId: 1,
        status: 'ACTIVE',
      },
    });
  });

  test('should return error for missing required fields', async () => {
    const mockRequest = {
      user: { id: 1 },
      body: {
        license: '',
        brand: '',
        model: '',
        year: null,
      },
    } as any;

    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    await createVehicle(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: 'Los campos patente, marca, modelo y año son requeridos',
    });
  });

  test('should return error for duplicate license', async () => {
    const mockRequest = {
      user: { id: 1 },
      body: {
        license: 'ABC-123',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2023,
        color: 'Red',
      },
    } as any;

    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    jest.spyOn(VehicleModel, 'validarPatenteUnica').mockResolvedValue(false);

    await createVehicle(mockRequest, mockResponse);

    expect(VehicleModel.validarPatenteUnica).toHaveBeenCalledWith('ABC-123');
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: 'Ya existe un vehículo con esa patente',
    });
  });
});