import * as yup from 'yup';

// Schema base para vehículo
export const vehicleBaseSchema = yup.object().shape({
  license: yup
    .string()
    .required('La patente es requerida')
    .matches(/^[A-Z]{2,3}-?[0-9]{2,3}$/, 'Formato de patente inválido (ej: ABC-123)')
    .max(8, 'La patente no puede tener más de 8 caracteres'),
  brand: yup
    .string()
    .required('La marca es requerida')
    .max(50, 'La marca no puede tener más de 50 caracteres'),
  model: yup
    .string()
    .required('El modelo es requerido')
    .max(50, 'El modelo no puede tener más de 50 caracteres'),
  year: yup
    .number()
    .typeError('El año debe ser un número')
    .required('El año es requerido')
    .integer('Ingrese un año válido')
    .min(1900, 'El año debe ser mayor o igual a 1900')
    .max(2099, 'El año debe ser menor o igual a 2099'),
  color: yup
    .string()
    .nullable()
    .max(30, 'El color no puede tener más de 30 caracteres'),
  status: yup
    .string()
    .oneOf(['ACTIVE', 'INACTIVE'], 'Estado inválido')
    .optional()
    .default('ACTIVE')
});

// Schema para crear vehículo
export const vehicleCreateSchema = vehicleBaseSchema.shape({
  userId: yup
    .number()
    .required('ID de usuario requerido')
    .positive('ID de usuario inválido')
});

// Schema para edición de vehículo
export const vehicleEditSchema = yup.object().shape({
  license: yup
    .string()
    .matches(/^[A-Z]{2,3}-?[0-9]{2,3}$/, 'Formato de patente inválido (ej: ABC-123)')
    .max(8, 'La patente no puede tener más de 8 caracteres')
    .optional(),
  brand: yup
    .string()
    .max(50, 'La marca no puede tener más de 50 caracteres')
    .optional(),
  model: yup
    .string()
    .max(50, 'El modelo no puede tener más de 50 caracteres')
    .optional(),
  year: yup
    .number()
    .typeError('El año debe ser un número')
    .integer('Ingrese un año válido')
    .min(1900, 'El año debe ser mayor o igual a 1900')
    .max(2099, 'El año debe ser menor o igual a 2099')
    .optional(),
  color: yup
    .string()
    .max(30, 'El color no puede tener más de 30 caracteres')
    .optional(),
  status: yup
    .string()
    .oneOf(['ACTIVE', 'INACTIVE'], 'Estado inválido')
    .optional()
});

// Schema para cambio de estado de vehículo
export const vehicleStatusUpdateSchema = yup.object().shape({
  status: yup
    .string()
    .required('El estado es requerido')
    .oneOf(['ACTIVE', 'INACTIVE'], 'Estado inválido')
});

// Schema para formulario de vehículo
export const vehicleFormSchema = yup.object().shape({
  license: yup
    .string()
    .required('La patente es requerida')
    .matches(/^[A-Z]{2,3}-?[0-9]{2,3}$/, 'Formato de patente inválido (ej: ABC-123)')
    .max(8, 'La patente no puede tener más de 8 caracteres'),
  brand: yup
    .string()
    .required('La marca es requerida')
    .max(50, 'La marca no puede tener más de 50 caracteres'),
  model: yup
    .string()
    .required('El modelo es requerido')
    .max(50, 'El modelo no puede tener más de 50 caracteres'),
  year: yup
    .number()
    .typeError('El año debe ser un número')
    .required('El año es requerido')
    .integer('Ingrese un año válido')
    .min(1900, 'El año debe ser mayor o igual a 1900')
    .max(2099, 'El año debe ser menor o igual a 2099'),
  color: yup
    .string()
    .nullable()
    .max(30, 'El color no puede tener más de 30 caracteres')
});
