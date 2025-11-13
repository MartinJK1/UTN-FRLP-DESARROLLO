import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Carousel } from 'react-bootstrap';
import ServiceCard from '../components/ServiceCard';
import OptimizedImage from '../components/OptimizedImage';
import '../assets/styles/servicios.css';

export default function Servicios() {
  const navigate = useNavigate();

  // Imágenes del carrusel de servicios
  const serviceImages = [
    {
      src: '/mecanico-auto.webp',
      alt: 'Cambio de aceite profesional'
    },
    {
      src: '/limpieza-motor.webp',
      alt: 'Limpieza de motor'
    },
    {
      src: '/diagnostico-electrico.webp',
      alt: 'Diagnóstico electrónico'
    },
    {
      src: '/cambiando-aceite2.webp',
      alt: 'Revisión completa'
    },
    {
      src: '/Cambiar-filtro.webp',
      alt: 'Cambiar Filtros'
    }
  ];

  // Servicios estáticos
  const services = [
    {
      id: 1,
      name: 'Cambio de Aceite',
      icon: 'bi bi-droplet-fill',
      description: 'Servicio rápido y seguro con aceites de la más alta calidad. Incluye revisión completa de niveles y filtros para garantizar el máximo rendimiento de tu motor.',
      estimated_time: '30-45 minutos',
      features: [
        'Aceites sintéticos y semisintéticos premium',
        'Filtro de aceite original Renault incluido',
        'Revisión completa de niveles de fluidos',
        'Inspección visual de componentes'
      ]
    },
    {
      id: 2,
      name: 'Limpieza de Motor',
      icon: 'bi bi-speedometer2',
      description: 'Eliminamos residuos y depósitos acumulados para mejorar el rendimiento general del vehículo. Utilizamos productos especializados que protegen tus componentes.',
      estimated_time: '45-60 minutos',
      features: [
        'Limpieza interna profunda del motor',
        'Productos de limpieza especializados Renault',
        'Mejora el rendimiento y eficiencia',
        'Reduce consumo de combustible'
      ]
    },
    {
      id: 3,
      name: 'Diagnóstico Electrónico',
      icon: 'bi bi-cpu-fill',
      description: 'Detectamos fallas y problemas con equipamiento de última generación. Recibís un informe completo y detallado del estado de tu vehículo.',
      estimated_time: '20-30 minutos',
      features: [
        'Scanner OBD2 de última generación',
        'Lectura completa de códigos de error',
        'Informe detallado impreso',
        'Asesoramiento técnico profesional'
      ]
    },
    {
      id: 4,
      name: 'Cambio de Filtros',
      icon: 'bi bi-funnel-fill',
      description: 'Reemplazo de filtros de aceite, aire y combustible para mantener tu motor en óptimas condiciones. Filtros originales Renault de alta calidad.',
      estimated_time: '25-35 minutos',
      features: [
        'Filtro de aceite original Renault',
        'Filtro de aire de alta eficiencia',
        'Filtro de combustible (si aplica)',
        'Revisión del sistema de filtrado'
      ]
    }
  ];

  const handleReserve = () => {
    navigate('/reservar');
  };

  return (
    <main className="servicios-page">
      <section className="servicios-hero">
        <div className="servicios-hero-overlay"></div>
        <Container className="servicios-hero-content">
          <h1 className="servicios-hero-title">
            Nuestros <span className="text-accent">Servicios</span>
          </h1>
          <p className="servicios-hero-subtitle">
            Ofrecemos cambios de aceite, limpieza y diagnóstico de motor con los más altos estándares de calidad.
            Nuestro equipo de profesionales está capacitado para brindarte el mejor servicio.
          </p>
          <button className="btn-servicios-hero" onClick={handleReserve}>
            <i className="bi bi-calendar-check me-2"></i>
            Reservar Turno
          </button>
        </Container>
      </section>
      <section className="servicios-main-section">
        <Container>
          <Row className="g-4">
            <Col lg={4} md={12}>
              <div className="servicios-media-container">
                <div className="servicios-video-wrapper">
                    <video 
                    className="servicios-video"
                    autoPlay
                    muted
                    loop
                    playsInline
                    controls
                    poster="/servicio-lubricentro.jpg"
                    >
                      <source src="/mecanico-hechando-aceite.webm" type="video/webm" />
                      Tu navegador no soporta el elemento de video.
                    </video>
                </div>
                <div className="servicios-carousel-wrapper">
                  <Carousel 
                    interval={4000} 
                    fade 
                    controls={true} 
                    indicators={true}
                    className="servicios-carousel"
                  >
                    {serviceImages.map((image, index) => (
                      <Carousel.Item key={index}>
                        <OptimizedImage
                          src={image.src}
                          alt={image.alt}
                          aspectRatio="4/3"
                          objectFit="cover"
                          className="servicios-carousel-image"
                        />
                      </Carousel.Item>
                    ))}
                  </Carousel>
                </div>
              </div>
            </Col>

            {/* Columna derecha: Grid de servicios 2x2 */}
            <Col lg={8} md={12}>
              <div className="servicios-list-container">
                <h2 className="servicios-list-title">
                  <i className="bi bi-star-fill me-2"></i>
                  Nuestros Servicios
                </h2>
                
                <div className="servicios-cards-grid">
                  {services.map((service) => (
                    <ServiceCard
                      key={service.id}
                      icon={service.icon}
                      name={service.name}
                      description={service.description}
                      duration={service.estimated_time}
                      features={service.features}
                      onReserve={handleReserve}
                    />
                  ))}
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
      <section className="servicios-benefits-section">
        <Container>
          <h2 className="benefits-title">¿Por qué elegirnos?</h2>
          <Row className="g-4">
            <Col md={4}>
              <div className="benefit-card">
                <div className="benefit-icon">
                  <i className="bi bi-shield-fill-check"></i>
                </div>
                <h3>Garantía de Calidad</h3>
                <p>Todos nuestros servicios cuentan con garantía y respeto oficial Renault.</p>
              </div>
            </Col>
            <Col md={4}>
              <div className="benefit-card">
                <div className="benefit-icon">
                  <i className="bi bi-clock-history"></i>
                </div>
                <h3>Servicio Rápido</h3>
                <p>Respetamos tu tiempo. Todos nuestros servicios se completan en el día.</p>
              </div>
            </Col>
            <Col md={4}>
              <div className="benefit-card">
                <div className="benefit-icon">
                  <i className="bi bi-people-fill"></i>
                </div>
                <h3>Profesionales Capacitados</h3>
                <p>Nuestro equipo cuenta con certificación y años de experiencia.</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </main>
  );
}