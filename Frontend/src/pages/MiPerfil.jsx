import { useEffect } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { usarAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useApiMutation, useApiQuery } from '../hooks/useApi';
import apiService from '../services/apiService';
import { userProfileUpdateSchema } from '../validations';
import { dividirNombreCompleto, combinarNombreCompleto } from '../utils/dateUtils';
import '../assets/styles/perfil.css';
import CustomButton from '../components/CustomButton';
import LoadingSpinner from '../components/LoadingSpinner';

export default function MiPerfil() {
  const { usuario } = usarAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const { register, handleSubmit, formState: { errors, isSubmitting, isDirty }, reset } = useForm({
    resolver: yupResolver(userProfileUpdateSchema),
  });

  // Obtiene los datos del perfil del usuario
  const { data: profileResponse, isLoading: isLoadingProfile } = useApiQuery(
    ['perfilUsuario', usuario?.id],
    () => apiService.getUserProfile(),
    {
      enabled: !!usuario?.id
    }
  );
  const profileData = profileResponse?.data;

  useEffect(() => {
    if (profileData) {
      const { nombre, apellido } = dividirNombreCompleto(profileData.name);
      reset({
        nombre: nombre || '',
        apellido: apellido || '',
        email: profileData.email || '',
        telefono: profileData.phone || ''
      });
    }
  }, [profileData, reset]);

  const updateUserMutation = useApiMutation(
    (data) => apiService.updateUserProfile(data),
    ['perfilUsuario', usuario?.id],
    {
      onSuccess: () => {
        showSuccess('Tu perfil ha sido actualizado exitosamente.');
      },
      onError: (error) => {
        showError(error.message || 'Ocurrió un error al actualizar tu perfil.');
      }
    }
  );

  const manejarGuardar = async (formData) => {
    const datosPerfilParaBackend = {
      name: combinarNombreCompleto(formData.nombre, formData.apellido),
      email: formData.email,
      phone: formData.telefono
    };
    
    await updateUserMutation.mutateAsync(datosPerfilParaBackend);
  };

  if (isLoadingProfile) {
    return <LoadingSpinner />;
  }

  return (
    <div className="perfil-container">
      <div className="perfil-header">
        <h1>Mi Perfil</h1>
        <p>Gestiona tu información personal</p>
      </div>
      <div className="perfil-contenedor-principal">
        <div className="perfil-info-cuenta">
          <h3>
            <i className="bi bi-person-circle me-2"></i>
            Información de la Cuenta
          </h3>
          
          <Row>
            <Col md={6}>
              <p><strong>Rol:</strong> {profileData?.role === 'ADMIN' ? 'Administrador' : 'Cliente'}</p>
              <p><strong>Vehículos Registrados:</strong> {profileData?.vehicles?.length || 0}</p>
            </Col>
            <Col md={6}>
              <p><strong>Fecha de Registro:</strong> {profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString('es-ES') : 'N/A'}</p>
              <p><strong>Fecha de Actualización:</strong> {profileData?.updatedAt ? new Date(profileData.updatedAt).toLocaleDateString('es-ES') : 'N/A'}</p>
            </Col>
          </Row>
        </div>
        <div className="perfil-formulario-edicion">
          <h3>
            <i className="bi bi-pencil-square me-2"></i>
            Editar Información Personal
          </h3>
          
          <Form onSubmit={handleSubmit(manejarGuardar)}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label className="perfil-form-label">
                    Nombre *
                  </Form.Label>
                  <Form.Control
                    type="text"
                    {...register('nombre')}
                    isInvalid={!!errors.nombre}
                    placeholder="Ingrese su nombre"
                    className="perfil-form-control"
                  />
                  <Form.Control.Feedback type="invalid" className="perfil-feedback-invalid">
                    {errors.nombre?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label className="perfil-form-label">
                    Apellido *
                  </Form.Label>
                  <Form.Control
                    type="text"
                    {...register('apellido')}
                    isInvalid={!!errors.apellido}
                    placeholder="Ingrese su apellido"
                    className="perfil-form-control"
                  />
                  <Form.Control.Feedback type="invalid" className="perfil-feedback-invalid">
                    {errors.apellido?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label className="perfil-form-label">
                    Email *
                  </Form.Label>
                  <Form.Control
                    type="email"
                    {...register('email')}
                    isInvalid={!!errors.email}
                    placeholder="ejemplo@email.com"
                    className="perfil-form-control"
                  />
                  <Form.Control.Feedback type="invalid" className="perfil-feedback-invalid">
                    {errors.email?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label className="perfil-form-label">
                    Teléfono *
                  </Form.Label>
                  <Form.Control
                    type="tel"
                    {...register('telefono')}
                    isInvalid={!!errors.telefono}
                    placeholder="11 1234-5678"
                    className="perfil-form-control"
                  />
                  <Form.Control.Feedback type="invalid" className="perfil-feedback-invalid">
                    {errors.telefono?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <div className="perfil-d-grid">
              <CustomButton 
                variant="primary" 
                type="submit" 
                disabled={!isDirty || isSubmitting || updateUserMutation.isPending}
                className="perfil-boton-guardar"
              >
                {isSubmitting || updateUserMutation.isPending ? (
                  <>
                    <span className="perfil-spinner spinner-border spinner-border-sm me-2" role="status"></span>
                    Guardando cambios...
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </CustomButton>
            </div>
          </Form>
        </div>

        <div className="perfil-seccion-seguridad">
          <h3>
            <i className="bi bi-shield-lock me-2"></i>
            Seguridad
          </h3>
          
          <div className="perfil-seguridad-contenido">
            <div className="perfil-seguridad-info">
              <p className="mb-1"><strong>Contraseña</strong></p>
              <p className="text-muted-light mb-0">Última actualización: {profileData?.updatedAt ? `el ${new Date(profileData.updatedAt).toLocaleDateString('es-ES')}` : 'N/A'}</p>
            </div>
            <Button 
              variant="outline-warning"
              size="sm"
              className="perfil-boton-cambiar-password"
              onClick={() => navigate('/change-password')}
            >
              Cambiar Contraseña
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 