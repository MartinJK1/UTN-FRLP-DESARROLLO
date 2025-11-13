import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { passwordRecoverySchema } from '../validations';
import { useApiMutation } from '../hooks/useApi';
import apiService from '../services/apiService';
import '../assets/styles/recuperarcontrasena.css';

export default function OlvideMiContraseña() {
  const recoverPasswordMutation = useApiMutation(
    (email) => apiService.recoverPassword(email),
    []
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(passwordRecoverySchema),
    mode: 'onChange'
  });

  const onSubmit = async (data) => {
    await recoverPasswordMutation.mutateAsync(data.email);
    reset();
  };

  return (
    <div className="recuperarcontrasena-container">
      <div className="recuperarcontrasena-header">
        <h1>Olvidé mi Contraseña</h1>
        <p>Te enviaremos un enlace para restablecer tu contraseña</p>
      </div>

      <div className="recuperarcontrasena-formulario-container">
        {recoverPasswordMutation.isSuccess && (
          <Alert variant="success" className="recuperarcontrasena-alert-exito">
            <i className="bi bi-check-circle-fill me-2"></i>
            <strong>¡Email enviado!</strong><br />
            Si el email existe y está verificado, recibirás un enlace.
          </Alert>
        )}

        {recoverPasswordMutation.isError && (
          <Alert variant="danger" className="recuperarcontrasena-alert-error">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            <strong>Error:</strong> {recoverPasswordMutation.error.message}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="recuperarcontrasena-form-group">
            <label className="form-label">Email de Registro *</label>
            <input
              type="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              placeholder="ejemplo@email.com"
              {...register('email')}
            />
            {errors.email && (
              <div className="invalid-feedback">{errors.email.message}</div>
            )}
          </div>

          <div className="d-grid gap-3 mb-4">
            <Button 
              variant="primary" 
              type="submit" 
              disabled={recoverPasswordMutation.isPending}
              className="recuperarcontrasena-boton-enviar"
            >
              {recoverPasswordMutation.isPending ? 'Enviando email...' : 'Enviar Email de Recuperación'}
            </Button>
          </div>

          <div className="text-center">
            <p className="recuperarcontrasena-texto-volver">
              ¿Recordaste tu contraseña?{' '}
              <Link to="/login" className="recuperarcontrasena-link-volver">
                Volver al Login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
