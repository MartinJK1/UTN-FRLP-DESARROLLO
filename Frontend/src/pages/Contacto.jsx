import { Container, Row, Col, Form } from 'react-bootstrap';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { contactFormSchema } from '../validations';
import '../assets/styles/contacto.css';
import { usarAuth } from '../context/AuthContext';

export default function Contacto() {
  const { usuario, estaAutenticado } = usarAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
    getValues
  } = useForm({
    resolver: yupResolver(contactFormSchema),
    mode: 'onChange'
  });

  useEffect(() => {
    if (estaAutenticado && usuario) {
      const valoresActuales = getValues();
      reset({
        ...valoresActuales,
        name: usuario.nombre || '',
        email: usuario.email || ''
      });
    }
  }, [estaAutenticado, usuario, getValues, reset]);

  const onSubmit = async (data) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(`Mensaje enviado por ${data.name}`);
      reset();
    } catch (error) {
      console.error(error);
      setError("root", { 
        type: "manual", 
        message: "Error al enviar el mensaje" 
      });
    }
  };

  return (
    <main className="contacto-page">
      <section className="contacto-hero">
        <div className="contacto-hero-overlay"></div>
        <Container className="contacto-hero-content">
          <h1 className="contacto-hero-title">Contacto</h1>
          <p className="contacto-hero-subtitle">
            Estamos aquí para ayudarte. Contáctanos y te responderemos a la brevedad.
          </p>
        </Container>
      </section>
      <section className="contacto-main-section">
        <Container>
          <Row className="g-4">
            <Col lg={6} md={12}>
              <div className="contacto-form-wrapper">
                <h2 className="contacto-section-title">
                  Envianos un mensaje
                </h2>

                {errors.root && (
                  <div className="contacto-alert-error">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {errors.root.message}
                  </div>
                )}

                <Form onSubmit={handleSubmit(onSubmit)} className="contacto-form">
                  <Form.Group className="contacto-form-group">
                    <Form.Label className="contacto-label">Nombre</Form.Label>
                    <Form.Control
                      {...register("name")}
                      type="text"
                      placeholder="Tu nombre"
                      readOnly={estaAutenticado}
                      className={`contacto-input ${errors.name ? "input-error" : ""}`}
                    />
                    {errors.name && (
                      <span className="contacto-error-message">{errors.name.message}</span>
                    )}
                  </Form.Group>

                  <Form.Group className="contacto-form-group">
                    <Form.Label className="contacto-label">Email</Form.Label>
                    <Form.Control
                      {...register("email")}
                      type="email"
                      placeholder="tu@email.com"
                      readOnly={estaAutenticado}
                      className={`contacto-input ${errors.email ? "input-error" : ""}`}
                    />
                    {errors.email && (
                      <span className="contacto-error-message">{errors.email.message}</span>
                    )}
                  </Form.Group>

                  <Form.Group className="contacto-form-group">
                    <Form.Label className="contacto-label">Mensaje</Form.Label>
                    <Form.Control
                      {...register("message")}
                      as="textarea"
                      rows={5}
                      placeholder="¿En qué podemos ayudarte?"
                      className={`contacto-input ${errors.message ? "input-error" : ""}`}
                    />
                    {errors.message && (
                      <span className="contacto-error-message">{errors.message.message}</span>
                    )}
                  </Form.Group>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="contacto-submit-btn"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Enviando...
                      </>
                    ) : (
                      'Enviar Mensaje'
                    )}
                  </button>
                </Form>
              </div>
            </Col>
            <Col lg={6} md={12}>
              <div className="contacto-info-wrapper">
                <h2 className="contacto-section-title">
                  Información de contacto
                </h2>

                <div className="contacto-info-grid">
                  <div className="contacto-info-item">
                    <div className="contacto-info-icon">
                      <i className="bi bi-geo-alt-fill"></i>
                    </div>
                    <div className="contacto-info-content">
                      <h3>Dirección</h3>
                      <p>Av. 60 N° 2350, La Plata, Argentina</p>
                    </div>
                  </div>

                  <div className="contacto-info-item">
                    <div className="contacto-info-icon">
                      <i className="bi bi-telephone-fill"></i>
                    </div>
                    <div className="contacto-info-content">
                      <h3>Teléfono</h3>
                      <p>+54 221 1234-5678</p>
                    </div>
                  </div>

                  <div className="contacto-info-item">
                    <div className="contacto-info-icon">
                      <i className="bi bi-envelope-fill"></i>
                    </div>
                    <div className="contacto-info-content">
                      <h3>Email</h3>
                      <p>info@lubricentrorenault.com</p>
                    </div>
                  </div>
                </div>
                <div className="contacto-horarios">
                  <h3 className="contacto-horarios-title">Horarios de atención</h3>
                  <div className="contacto-horarios-content">
                    <p><strong>Lunes a Viernes:</strong> 8:00 - 18:00</p>
                    <p><strong>Sabados y Domingos:</strong> Cerrado</p>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </main>
  );
}