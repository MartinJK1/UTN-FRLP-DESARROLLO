import { Form, Alert, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { usarAuth } from '../context/AuthContext';
import '../assets/styles/registro.css';
import CustomButton from '../components/CustomButton';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { userRegistrationSchema } from '../validations';

export default function Registro() {
  const navigate = useNavigate();
  const { registrarUsuario } = usarAuth();
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting },
    setError
  } = useForm({
    resolver: yupResolver(userRegistrationSchema),
    mode: 'onChange' // valida en el momento de escritura
  });

  const onSubmit = async (data) => {
    try {
      const resultado = await registrarUsuario(data);
      
      if (resultado.exito) {
        navigate('/login');
      } else {
        setError("root", { 
          type: "manual", 
          message: resultado.error || "Error al registrar usuario" 
        });
      }
      
    } catch (error) {
      console.error(error);
      setError("root", { 
        type: "manual", 
        message: "Error de conexión. Intente nuevamente." 
      });
    }
  };

  return (
    <div className="registro-container">
      <div className="registro-header">
        <h1>Crear Cuenta</h1>
        <p>Únete a Lubricentro Renault</p>
      </div>

      <div className="registro-form-container">
        {errors.root && (
          <Alert variant="danger" className="registro-alert danger">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {errors.root.message}
          </Alert>
        )}

        <Form onSubmit={handleSubmit(onSubmit)}>
          <Row className="registro-mb-4">
            <Col md={6}>
              <Form.Group className="registro-form-group mb-2">
                <Form.Label className="registro-form-label">
                  Nombre *
                </Form.Label>
                <Form.Control
                  {...register("nombre")}
                  type="text"
                  isInvalid={!!errors.nombre}
                  placeholder="Ingrese su nombre"
                  className={`registro-form-control ${errors.nombre ? 'input-error' : ''}`}
                />
                {errors.nombre && (
                  <span className="field-error">{errors.nombre.message}</span>
                )}
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="registro-form-group mb-2">
                <Form.Label className="registro-form-label">
                  Apellido *
                </Form.Label>
                <Form.Control
                  {...register("apellido")}
                  type="text"
                  isInvalid={!!errors.apellido}
                  placeholder="Ingrese su apellido"
                  className={`registro-form-control ${errors.apellido ? 'input-error' : ''}`}
                />
                {errors.apellido && (
                    <span className="field-error">{errors.apellido.message}</span>
                )}
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="registro-form-group mb-4">
            <Form.Label className="registro-form-label">
              Email *
            </Form.Label>
            <Form.Control
              {...register("email")}
              type="email"
              isInvalid={!!errors.email}
              placeholder="ejemplo@email.com"
              className={`registro-form-control ${errors.email ? 'input-error' : ''}`}
              />
            {errors.email && (
              <span className="field-error">{errors.email.message}</span>
            )}
          </Form.Group>

          <Form.Group className="registro-form-group mb-4">
            <Form.Label className="registro-form-label">
              Teléfono *
            </Form.Label>
            <Form.Control
              {...register("telefono")}
              type="tel"
              isInvalid={!!errors.telefono}
              placeholder="11 1234-5678"
              className={`registro-form-control ${errors.telefono ? 'input-error' : ''}`}
              />
            {errors.telefono && (
              <span className="field-error">{errors.telefono.message}</span>
            )}
          </Form.Group>

          <Row className="registro-mb-4">
            <Col md={6}>
              <Form.Group className="registro-form-group mb-4">
                <Form.Label className="registro-form-label">
                  Contraseña *
                </Form.Label>
                <Form.Control
                  {...register("password")}
                  type="password"
                  isInvalid={!!errors.password}
                  placeholder="Mínimo 8 caracteres"
                  className={`registro-form-control ${errors.password ? 'input-error' : ''}`}
                  />
                {errors.password && (
                  <span className="field-error">{errors.password.message}</span>
                )}
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="registro-form-group mb-4">
                <Form.Label className="registro-form-label">
                  Confirmar Contraseña *
                </Form.Label>
                <Form.Control
                  {...register("confirmarPassword")}
                  type="password"
                  isInvalid={!!errors.confirmarPassword}
                  placeholder="Repita su contraseña"
                  className={`registro-form-control ${errors.confirmarPassword ? 'input-error' : ''}`}
                  />
                {errors.confirmarPassword && (
                  <span className="field-error">{errors.confirmarPassword.message}</span>
                )}
              </Form.Group>
            </Col>
          </Row>

          <div className="d-grid gap-3 registro-mb-4">
            <CustomButton 
              type="submit" 
              disabled={isSubmitting}
              variant="primary"
              size="medium"
              className="custom-btn--full"
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Creando cuenta...
                </>
              ) : (
                'Crear Cuenta'
              )}
            </CustomButton>
          </div>

          <div className="registro-text-center">
            <p className="registro-text">
              ¿Ya tienes una cuenta?{' '}
              <Link 
                to="/login" 
                className="registro-link"
              >
                Iniciar Sesión
              </Link>
            </p>
          </div>
        </Form>
      </div>
    </div>
  );
}