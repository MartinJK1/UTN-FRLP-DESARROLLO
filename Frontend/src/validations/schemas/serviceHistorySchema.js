import * as yup from 'yup';

export const serviceHistorySchema = yup.object().shape({
  servicio: yup.string().required('El servicio es requerido'),
  resultado: yup.string().required('El resultado es requerido'),
  observaciones: yup.string().trim().required('Las observaciones son requeridas'),
  repuestos: yup.string().trim(),
  kilometraje: yup.number()
    .typeError('El kilometraje debe ser un número')
    .positive('El kilometraje no puede ser negativo')
    .required('El kilometraje es requerido')
    .integer('El kilometraje debe ser un número entero'),
  mecanico: yup.string().trim().required('El mecánico es requerido'),
});
