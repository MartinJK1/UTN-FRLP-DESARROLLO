import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Alert } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { createPasswordChangeSchema } from '../validations';
import apiService from '../services/apiService';
import { usarAuth } from '../context/AuthContext';
import { useApiMutation, useApiQuery } from '../hooks/useApi';
import '../assets/styles/recuperarcontrasena.css';

export default function RecuperarContraseña() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { usuario, estaAutenticado } = usarAuth();

  const esCambioDesdePerfil = useMemo(() => estaAutenticado && !token, [estaAutenticado, token]);

  const { data: tokenValidation, isError: isTokenInvalid } = useApiQuery(
    ['validateRecoveryToken', token],
    () => apiService.request(`/auth/validate-recovery-token/${token}`, { method: 'GET' }),
    {
      enabled: !!token && !esCambioDesdePerfil,
      retry: false
    }
  );

  const changePasswordMutation = useApiMutation(
    (data) => apiService.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    [],
    {
      onSuccess: () => {
        setTimeout(() => navigate('/mi-perfil?passwordChanged=true'), 3000);
      },
    }
  );

  const resetPasswordMutation = useApiMutation(
    (data) => apiService.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    [],
    {
      onSuccess: () => {
        setTimeout(() => navigate('/login?passwordReset=true'), 3000);
      },
    }
  );

  const schema = useMemo(() => createPasswordChangeSchema(esCambioDesdePerfil), [esCambioDesdePerfil]);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange'
  });

  const onSubmit = async (data) => {
    if (esCambioDesdePerfil) {
      await changePasswordMutation.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
    } else {
      await resetPasswordMutation.mutateAsync({
        token,
        newPassword: data.newPassword,
      });
    }
    reset();
  };

  const mutationState = esCambioDesdePerfil ? changePasswordMutation : resetPasswordMutation;

  if (!token && !esCambioDesdePerfil) {
    return (
      <div className="recuperarcontrasena-container">
        <div className="recuperarcontrasena-header">
          <h1>Acceso Denegado</h1>
        </div>
        <div className="recuperarcontrasena-formulario-container">
          <Alert variant="warning">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            Acceso no autorizado. Esta página requiere un token de recuperación o estar autenticado.
          </Alert>
          <div className="d-grid gap-2">
             <Button as={Link} to="/forgot-password" variant="primary">Solicitar Enlace</Button>
             <Button as={Link} to="/login" variant="outline-secondary">Ir al Login</Button>
          </div>
        </div>
      </div>
    );
  }
  
  if (isTokenInvalid) {
    return (
      <div className="recuperarcontrasena-container">
        <div className="recuperarcontrasena-header">
          <h1>Token Inválido</h1>
          <p>El enlace de recuperación no es válido o ha expirado</p>
        </div>
        <div className="recuperarcontrasena-formulario-container">
          <Alert variant="danger">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            <strong>Error:</strong> {tokenValidation?.error || 'Token inválido.'}
          </Alert>
          <div className="text-center">
            <Link to="/olvide-mi-contrasena" className="recuperarcontrasena-link-volver">
              Solicitar nuevo enlace de recuperación
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="recuperarcontrasena-container">
      <div className="recuperarcontrasena-header">
        <h1>{esCambioDesdePerfil ? 'Cambiar Contraseña' : 'Recuperar Contraseña'}</h1>
        <p>{esCambioDesdePerfil ? 'Ingresa tu contraseña actual y tu nueva contraseña' : 'Ingresa tu nueva contraseña'}</p>
      </div>

      <div className="recuperarcontrasena-formulario-container">
        {mutationState.isSuccess && (
          <Alert variant="success">
            <i className="bi bi-check-circle-fill me-2"></i>
            <strong>¡Contraseña actualizada!</strong> Serás redirigido en unos segundos.
          </Alert>
        )}

        {mutationState.isError && (
          <Alert variant="danger">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            <strong>Error:</strong> {mutationState.error.message || 'Ocurrió un error.'}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          {esCambioDesdePerfil && (
            <div className="recuperarcontrasena-form-group">
              <label className="form-label">Contraseña Actual *</label>
              <input
                type="password"
                className={`form-control ${errors.currentPassword ? 'is-invalid' : ''}`}
                {...register('currentPassword')}
              />
              <div className="invalid-feedback">{errors.currentPassword?.message}</div>
            </div>
          )}

          <div className="recuperarcontrasena-form-group">
            <label className="form-label">Nueva Contraseña *</label>
            <input
              type="password"
              className={`form-control ${errors.newPassword ? 'is-invalid' : ''}`}
              {...register('newPassword')}
            />
            <div className="invalid-feedback">{errors.newPassword?.message}</div>
          </div>

          <div className="recuperarcontrasena-form-group">
            <label className="form-label">Confirmar Nueva Contraseña *</label>
            <input
              type="password"
              className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
              {...register('confirmPassword')}
            />
            <div className="invalid-feedback">{errors.confirmPassword?.message}</div>
          </div>

          <div className="d-grid gap-3 mb-4">
            <Button 
              variant="primary" 
              type="submit" 
              disabled={mutationState.isPending}
              className="recuperarcontrasena-boton-enviar"
            >
              {mutationState.isPending ? 'Cambiando contraseña...' : 'Cambiar Contraseña'}
            </Button>
          </div>

          <div className="text-center">
            <p className="recuperarcontrasena-texto-volver">
              <Link to={esCambioDesdePerfil ? "/mi-perfil" : "/login"} className="recuperarcontrasena-link-volver">
                {esCambioDesdePerfil ? "Volver al Perfil" : "Volver al Login"}
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
