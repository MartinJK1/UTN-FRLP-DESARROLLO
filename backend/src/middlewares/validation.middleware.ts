import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export function validate(schema: ZodSchema, property: 'body' | 'params' | 'query' = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req[property];
      const validatedData = schema.parse(data);
      req[property] = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((err) => ({
          field: err.path.map(String).join('.'),
          message: err.message
        }));

        return res.status(400).json({
          success: false,
          error: 'Datos de entrada inválidos',
          details: errorMessages
        });
      }
      
      next(error);
    }
  };
}
