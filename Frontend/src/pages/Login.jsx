import { Form, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { usarAuth } from '../context/AuthContext';
import CustomButton from '../components/CustomButton';
import '../assets/styles/login.css';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { userLoginSchema } from '../validations/schemas/userSchema';

export default function Login() {
  const navigate = useNavigate();
  const { iniciarSesion } = usarAuth();

  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting },
    setError
  } = useForm({
    resolver: yupResolver(userLoginSchema),
    mode: 'onChange' // valida en el momento de escritura
  });

  const onSubmit = async (data) => {
    try {
      const resultado = await iniciarSesion(data);
      
      if (resultado.exito) {
        navigate('/mis-vehiculos');
      } else {
        setError("root", { 
          type: "manual", 
          message: resultado.error || "Credenciales inválidas" 
        });
      }
    } catch (error) {
      console.log(error);
      setError("root", { 
        type: "manual", 
        message: "Error de conexión. Intente nuevamente." 
      });
    }
  };

  return (
    <div className="login-container">
      {/* Header  */}
      <div className="login-header">
        <h1>Iniciar Sesión</h1>
        <p>Accede a tu cuenta de Lubricentro Renault</p>
      </div>

      {/* Contenedor */}
      <div className="login-form-container">
        {errors.root && (
          <Alert variant="danger" className="login-alert danger">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {errors.root.message}
          </Alert>
        )}

        <Form onSubmit={handleSubmit(onSubmit)}>
          <Form.Group className="login-form-group">
            <Form.Label className="login-form-label">
              Email *
            </Form.Label>
            <Form.Control
              {...register("email")}
              type="email"
              placeholder="juanperez@email.com"
              className={`login-form-control ${errors.email ? 'input-error' : ''}`}
            />
            {errors.email && (
              <span className="field-error">{errors.email.message}</span>
            )}
          </Form.Group>

          <Form.Group className="login-form-group">
            <Form.Label className="login-form-label">
              Contraseña *
            </Form.Label>
            <Form.Control
              {...register("contraseña")}
              type="password"
              placeholder="Ingrese su contraseña"
              className={`login-form-control ${errors.contraseña ? 'input-error' : ''}`}
            />
            {errors.contraseña && (
              <span className="field-error">{errors.contraseña.message}</span>
            )}
          </Form.Group>

          <div className="d-grid gap-3 login-mb-4">
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
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </CustomButton>
          </div>

          <div className="login-text-center login-mb-3">
            <Link 
              to="/olvide-mi-contrasena" 
              className="login-link"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <div className="login-text-center">
            <p className="login-text">
              ¿No tienes una cuenta?{' '}
              <Link 
                to="/registro" 
                className="login-link"
              >
                Registrarse
              </Link>
            </p>
          </div>
        </Form>
      </div>
    </div>
  );
} 