import * as yup from 'yup';

// Schema base para usuario
export const userBaseSchema = yup.object().shape({
  nombre: yup
    .string()
    .required('El nombre es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede tener más de 50 caracteres')
    .trim(),
  apellido: yup
    .string()
    .required('El apellido es requerido')
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido no puede tener más de 50 caracteres')
    .trim(),
  email: yup
    .string()
    .required('El email es requerido')
    .email('Debe ser un email válido')
    .transform(value => value ? value.toLowerCase().trim() : value),
  telefono: yup
    .string()
    .required('El teléfono es requerido')
    .matches(/^\d{10,15}$/, 'Ingrese un teléfono válido (10 a 15 dígitos)'),
  role: yup
    .string()
    .oneOf(['USER', 'ADMIN'], 'Rol inválido')
    .optional()
    .default('USER')
});

/**
 * Schema para registro de usuario - extiende el base con campos de contraseña
 */
export const userRegistrationSchema = userBaseSchema.shape({
  password: yup
    .string()
    .required('La contraseña es requerida')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .matches(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .matches(/[0-9]/, 'Debe contener al menos un número')
    .matches(/[!@#$%^&*()_\-+=[\]{};:'"\\|,.<>/?]/, 'Debe contener al menos un caracter especial'),
  confirmarPassword: yup
    .string()
    .required('Confirme su contraseña')
    .oneOf([yup.ref('password')], 'Las contraseñas no coinciden')
});

// Schema para login
export const userLoginSchema = yup.object().shape({
  email: yup
    .string()
    .required('El email es requerido')
    .email('Debe ser un email válido'),
  contraseña: yup
    .string()
    .required('La contraseña es requerida')
});

// Schema para edición de usuario
export const userEditSchema = yup.object().shape({
  nombre: yup
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede tener más de 50 caracteres')
    .optional(),
  apellido: yup
    .string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido no puede tener más de 50 caracteres')
    .optional(),
  email: yup
    .string()
    .email('Debe ser un email válido')
    .optional(),
  telefono: yup
    .string()
    .matches(/^\d{10,15}$/, 'Ingrese un teléfono válido (10 a 15 dígitos)')
    .optional()
});

// Schema para actualización de perfil
export const userProfileUpdateSchema = yup.object().shape({
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
  email: yup
    .string()
    .required('El email es requerido')
    .email('Debe ser un email válido'),
  telefono: yup
    .string()
    .required('El teléfono es requerido')
    .matches(/^\d{10,15}$/, 'Ingrese un teléfono válido (10 a 15 dígitos)')
});

// Schema para recuperación de contraseña
export const passwordRecoverySchema = yup.object().shape({
  email: yup
    .string()
    .required('El email es requerido')
    .email('Debe ser un email válido')
    .transform(value => value ? value.toLowerCase().trim() : value)
});

// Schema para resetear contraseña
export const resetPasswordSchema = yup.object().shape({
  currentPassword: yup
    .string()
    .required('La contraseña actual es requerida'),
  newPassword: yup
    .string()
    .required('La nueva contraseña es requerida')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .matches(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .matches(/[0-9]/, 'Debe contener al menos un número')
    .matches(/[!@#$%^&*()_\-+=[\]{};:'"\\|,.<>/?]/, 'Debe contener al menos un caracter especial'),
  confirmPassword: yup
    .string()
    .required('Confirme su nueva contraseña')
    .oneOf([yup.ref('newPassword')], 'Las contraseñas no coinciden')
});

// Schema dinámico para cambio de contraseña
export const createPasswordChangeSchema = (includeCurrentPassword = false) => {
  const baseSchema = {
    newPassword: yup
      .string()
      .required('La nueva contraseña es requerida')
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .matches(/[A-Z]/, 'Debe contener al menos una mayúscula')
      .matches(/[0-9]/, 'Debe contener al menos un número')
      .matches(/[!@#$%^&*()_\-+=[\]{};:'"\\|,.<>/?]/, 'Debe contener al menos un caracter especial'),
    confirmPassword: yup
      .string()
      .required('Confirme su nueva contraseña')
      .oneOf([yup.ref('newPassword')], 'Las contraseñas no coinciden')
  };

  if (includeCurrentPassword) {
    baseSchema.currentPassword = yup
      .string()
      .required('La contraseña actual es requerida');
  }

  return yup.object().shape(baseSchema);
};