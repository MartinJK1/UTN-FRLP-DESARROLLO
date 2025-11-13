/**
 *  Todos los Schemas de validacion centralizados
**/

// User schemas
export {
  userBaseSchema,
  userRegistrationSchema,
  userLoginSchema,
  userEditSchema,
  userProfileUpdateSchema,
  passwordRecoverySchema,
  resetPasswordSchema,
  createPasswordChangeSchema
} from './schemas/userSchema';

// Vehicle schemas
export {
  vehicleBaseSchema,
  vehicleCreateSchema,
  vehicleEditSchema,
  vehicleStatusUpdateSchema,
  vehicleFormSchema
} from './schemas/vehicleSchema';

// Reservation schemas
export {
  reservationBaseSchema,
  reservationCreateSchema,
  reservationFormSchema,
  reservationEditSchema,
  reservationStatusUpdateSchema
} from './schemas/reservationSchema';

// Contact schemas
export {
  contactBaseSchema,
  contactFormSchema,
  contactAdminSchema
} from './schemas/contactSchema';

// Service history schema
export {
  serviceHistorySchema
} from './schemas/serviceHistorySchema';