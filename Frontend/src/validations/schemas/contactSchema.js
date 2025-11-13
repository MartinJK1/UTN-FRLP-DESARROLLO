import * as yup from 'yup';

// Schema base para contacto
export const contactBaseSchema = yup.object().shape({
  name: yup
    .string()
    .required('El nombre es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede tener más de 100 caracteres')
    .trim(),
  email: yup
    .string()
    .required('El email es requerido')
    .email('Debe ser un email válido')
    .transform(value => value ? value.toLowerCase().trim() : value),
  message: yup
    .string()
    .required('El mensaje es requerido')
    .min(10, 'El mensaje debe tener al menos 10 caracteres')
    .max(1000, 'El mensaje no puede tener más de 1000 caracteres')
    .trim()
});

// Schema para formulario de contacto
export const contactFormSchema = yup.object().shape({
  name: yup
    .string()
    .required('El nombre es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede tener más de 100 caracteres')
    .trim(),
  email: yup
    .string()
    .required('El email es requerido')
    .email('Debe ser un email válido')
    .transform(value => value ? value.toLowerCase().trim() : value),
  message: yup
    .string()
    .required('El mensaje es requerido')
    .min(10, 'El mensaje debe tener al menos 10 caracteres')
    .max(1000, 'El mensaje no puede tener más de 1000 caracteres')
    .trim()
});

// Schema para contacto admin
export const contactAdminSchema = contactBaseSchema.shape({
  phone: yup
    .string()
    .matches(/^\d{10,15}$/, 'Ingrese un teléfono válido (10 a 15 dígitos)')
    .optional(),
  subject: yup
    .string()
    .max(200, 'El asunto no puede tener más de 200 caracteres')
    .optional(),
  priority: yup
    .string()
    .oneOf(['LOW', 'MEDIUM', 'HIGH', 'URGENT'], 'Prioridad inválida')
    .optional()
    .default('MEDIUM')
});
