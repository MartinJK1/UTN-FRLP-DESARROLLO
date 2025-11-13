import * as yup from 'yup';

// Schema base para reserva
export const reservationBaseSchema = yup.object().shape({
  userId: yup
    .number()
    .required('ID de usuario requerido')
    .positive('ID de usuario inválido'),
  vehicleId: yup
    .number()
    .required('ID de vehículo requerido')
    .positive('ID de vehículo inválido'),
  serviceId: yup
    .number()
    .required('ID de servicio requerido')
    .positive('ID de servicio inválido'),
  date: yup
    .string()
    .required('La fecha es requerida')
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
  time: yup
    .string()
    .required('La hora es requerida')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
  notes: yup
    .string()
    .max(500, 'Las observaciones no pueden tener más de 500 caracteres')
    .optional(),
  status: yup
    .string()
    .oneOf(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'], 'Estado inválido')
    .optional()
    .default('PENDING')
});

// Schema para crear reserva
export const reservationCreateSchema = reservationBaseSchema.shape({
  date: yup
    .string()
    .required('La fecha es requerida')
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)')
    .test('not-past', 'No se pueden hacer reservas en fechas pasadas', function(value) {
      if (!value) return false;
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }),
  time: yup
    .string()
    .required('La hora es requerida')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)')
    .test('valid-hours', 'Horario fuera del horario de atención (08:00-18:00)', function(value) {
      if (!value) return false;
      const hour = parseInt(value.split(':')[0]);
      return hour >= 8 && hour <= 18;
    })
});

// Schema para formulario de reserva
export const reservationFormSchema = yup.object().shape({
  nombre: yup
    .string()
    .required('El nombre es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede tener más de 50 caracteres'),
  apellido: yup
    .string()
    .required('El apellido es requerido')
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido no puede tener más de 50 caracteres'),
  telefono: yup
    .string()
    .required('El teléfono es requerido')
    .matches(/^\d{10,15}$/, 'Ingrese un teléfono válido (10 a 15 dígitos)'),
  email: yup
    .string()
    .required('El email es requerido')
    .email('Debe ser un email válido'),
  patente: yup
    .string()
    .required('La patente es requerida')
    .matches(/^[A-Z]{2,3}-?[0-9]{2,3}$/, 'Formato de patente inválido'),
  marca: yup
    .string()
    .required('La marca es requerida'),
  modelo: yup
    .string()
    .required('El modelo es requerido'),
  año: yup
    .number()
    .required('El año es requerido')
    .min(1900, 'Año inválido')
    .max(new Date().getFullYear() + 1, 'Año inválido'),
  servicio: yup
    .string()
    .required('Debe seleccionar un servicio'),
  fecha: yup.string()
    .required('La fecha es requerida')
    .test('not-past', 'No se pueden hacer reservas en fechas pasadas', function(value) {
      if (!value) return false;
      const selectedDate = new Date(`${value}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }),

  hora: yup.string()
    .required('Debe seleccionar una hora')
    .test('not-past-time', 'No se puede seleccionar una hora que ya pasó para el día de hoy', function(value) {
      const { fecha } = this.parent;
      if (!value || !fecha) {
        return true;
      }

      const selectedDate = new Date(`${fecha}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate.getTime() !== today.getTime()) {
        return true;
      }

      const selectedDateTime = new Date(`${fecha}T${value}`);
      const now = new Date();

      return selectedDateTime > now;
    }),

  observaciones: yup
    .string()
    .max(500, 'Las observaciones no pueden tener más de 500 caracteres')
    .optional()
});

// Schema para edición de reserva
export const reservationEditSchema = yup.object().shape({
  vehicleId: yup
    .number()
    .positive('ID de vehículo inválido')
    .optional(),
  serviceId: yup
    .number()
    .positive('ID de servicio inválido')
    .optional(),
  date: yup
    .string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)')
    .optional(),
  time: yup
    .string()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)')
    .optional(),
  notes: yup
    .string()
    .max(500, 'Las observaciones no pueden tener más de 500 caracteres')
    .optional(),
  status: yup
    .string()
    .oneOf(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'], 'Estado inválido')
    .optional()
});

// Schema para cambio de estado de reserva
export const reservationStatusUpdateSchema = yup.object().shape({
  status: yup
    .string()
    .required('El estado es requerido')
    .oneOf(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'], 'Estado inválido')
});
