import { authenticate } from './auth.middleware';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');

describe('authenticate middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {}, // Inicializar headers como un objeto vacío
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  test('Debería permitir el acceso para un token válido', () => {
    const mockToken = 'valid-token';
    const mockDecoded = { id: 1, email: 'test@example.com', role: 'USER' };

    mockRequest.headers = {}; // Asegurar que headers esté explícitamente inicializado
    mockRequest.headers.authorization = `Bearer ${mockToken}`;
    (jwt.verify as jest.Mock).mockReturnValue(mockDecoded);

    authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(jwt.verify).toHaveBeenCalledWith(mockToken, process.env.JWT_SECRET);
    expect(mockRequest.user).toEqual(mockDecoded);
    expect(nextFunction).toHaveBeenCalled();
  });

  test('Debería retornar 401 si no se proporciona el token', () => {
    authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: 'Token no proporcionado',
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  test('Debería retornar 401 para un token inválido', () => {
    const mockToken = 'invalid-token';

    mockRequest.headers = {}; // Asegurar que headers esté explícitamente inicializado
    mockRequest.headers.authorization = `Bearer ${mockToken}`;
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('Token inválido');
    });

    authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: 'Token inválido',
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  test('Debería retornar 401 para un token expirado', () => {
    const mockToken = 'expired-token';

    mockRequest.headers = {}; // Asegurar que headers esté explícitamente inicializado
    mockRequest.headers.authorization = `Bearer ${mockToken}`;
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new jwt.TokenExpiredError('Token expirado', new Date());
    });

    authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: 'Token expirado',
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });
});