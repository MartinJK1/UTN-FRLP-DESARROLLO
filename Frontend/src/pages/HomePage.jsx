import { Link, useNavigate } from "react-router-dom";
import { Container, Carousel } from 'react-bootstrap';
import { usarAuth } from "../context/AuthContext";
import OptimizedImage from '../components/OptimizedImage';
import '../assets/styles/home.css';

export default function HomePage() {
  const { estaAutenticado } = usarAuth();
  const navigate = useNavigate();
  const destinoReserva = estaAutenticado === true ? "/reservar" : "/registro";

  // Productos destacados para el carrusel
  const productosDestacados = [
    {
      id: 1,
      name: 'Aceite Sintético Premium',
      category: 'Aceites',
      image: '/aceite-premium.webp'
    },
    {
      id: 2,
      name: 'Filtro de Aceite Original',
      category: 'Filtros',
      image: '/filtro-aceite-original-renault.webp'
    },
    {
      id: 3,
      name: 'Bujías de Encendido',
      category: 'Bujías',
      image: '/bujias-encendido-renault-ngk.webp'
    },
    {
      id: 4,
      name: 'Aceite Motor 5W-30',
      category: 'Aceites',
      image: '/aceite-motor-5w30-renault.webp'
    }
  ];

  // Servicios destacados para el carrusel
  const serviciosDestacados = [
    {
      id: 1,
      name: 'Cambio de Aceite',
      description: 'Servicio rápido con aceites premium',
      image: '/cambio-aceite.webp'
    },
    {
      id: 2,
      name: 'Limpieza de Motor',
      description: 'Mejora el rendimiento general',
      image: '/limpieza-motor.webp'
    },
    {
      id: 3,
      name: 'Diagnóstico Electrónico',
      description: 'Equipamiento de última generación',
      image: '/diagnostico-electrico.webp'
    },
    {
      id: 4,
      name: 'Cambio de Filtros',
      description: 'Cambio de Filtros de Aire, Combustible y Aceite',
      image: '/Cambiar-filtro.webp'
    }
  ];

  // Función para hacer scroll suave a testimonios
  const scrollToTestimonios = () => {
    const seccion = document.getElementById("testimonios");
    seccion?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="home-page-container">
      <section className="home-hero-section">
        <div className="home-hero-overlay"></div>
        <Container className="home-hero-content">
          <div className="home-hero-text">
            <h1 className="home-hero-title">
              Bienvenido a
              <span className="home-hero-brand"> Lubricentro Renault</span>
            </h1>
            <p className="home-hero-subtitle">
              Gestiona tus turnos de manera fácil y rápida. Servicio profesional para tu vehículo Renault 
              con los más altos estándares de calidad.
            </p>
            
            <div className="home-hero-actions">
              <button
                onClick={() => navigate(destinoReserva)}
                className="btn-hero-primary"
              >
                <i className="bi bi-calendar-plus me-2"></i>
                Reservar Turno Ahora
              </button>
              <button
                onClick={() => navigate("/contacto")}
                className="btn-hero-secondary"
              >
                <i className="bi bi-telephone-fill me-2"></i>
                Contactanos
              </button>
            </div>
          </div>
        </Container>
      </section>
      <section className="home-quick-access-section">
        <Container>
          <div className="quick-access-grid">
            <button onClick={() => navigate("/productos")} className="quick-access-card">
              <div className="quick-access-icon">
                <i className="bi bi-tags-fill"></i>
              </div>
              <h3>Ofertas</h3>
              <p>Productos premium para tu Renault</p>
            </button>
            
            <button onClick={() => navigate("/servicios")} className="quick-access-card">
              <div className="quick-access-icon">
                <i className="bi bi-gear-wide-connected"></i>
              </div>
              <h3>Servicios</h3>
              <p>Mantenimiento profesional</p>
            </button>
            
            <button onClick={scrollToTestimonios} className="quick-access-card">
              <div className="quick-access-icon">
                <i className="bi bi-chat-quote-fill"></i>
              </div>
              <h3>Testimonios</h3>
              <p>Lo que dicen nuestros clientes</p>
            </button>
          </div>
        </Container>
      </section>
      <section className="home-products-section">
        <Container>
          <div className="home-section-header">
            <h2 className="home-section-title">
              Nuestros <span className="text-accent">Productos</span>
            </h2>
            <p className="home-section-subtitle">
              Descubrí nuestra amplia gama de aceites, filtros y aditivos para tu vehículo Renault.
            </p>
          </div>

          <div className="home-carousel-wrapper">
            <Carousel 
              interval={3500} 
              controls={true} 
              indicators={true}
              className="home-products-carousel"
            >
              {productosDestacados.map((producto) => (
                <Carousel.Item key={producto.id}>
                  <div className="home-carousel-item">
                    <OptimizedImage
                      src={producto.image}
                      alt={producto.name}
                      aspectRatio="16/9"
                      objectFit="cover"
                    />
                    <div className="home-carousel-caption">
                      <span className="carousel-category">{producto.category}</span>
                      <h3>{producto.name}</h3>
                    </div>
                  </div>
                </Carousel.Item>
              ))}
            </Carousel>
          </div>

          <div className="home-section-cta">
            <button onClick={() => navigate("/productos")} className="btn-home-cta">
              <span>Ver Todos los Productos</span>
              <i className="bi bi-arrow-right ms-2"></i>
            </button>
          </div>
        </Container>
      </section>
      <section className="home-services-section">
        <Container>
          <div className="home-section-header">
            <h2 className="home-section-title">
              Servicios <span className="text-accent">Ofrecidos</span>
            </h2>
            <p className="home-section-subtitle">
              Ofrecemos cambios de aceite, limpieza y diagnóstico de motor con equipamiento de última generación.
            </p>
          </div>

          <div className="home-carousel-wrapper">
            <Carousel 
              interval={3500} 
              controls={true} 
              indicators={true}
              className="home-services-carousel"
            >
              {serviciosDestacados.map((servicio) => (
                <Carousel.Item key={servicio.id}>
                  <div className="home-carousel-item">
                    <OptimizedImage
                      src={servicio.image}
                      alt={servicio.name}
                      aspectRatio="16/9"
                      objectFit="cover"
                    />
                    <div className="home-carousel-caption">
                      <h3>{servicio.name}</h3>
                      <p>{servicio.description}</p>
                    </div>
                  </div>
                </Carousel.Item>
              ))}
            </Carousel>
          </div>

          <div className="home-section-cta">
            <button onClick={() => navigate("/servicios")} className="btn-home-cta">
              <span>Ver Todos los Servicios</span>
              <i className="bi bi-arrow-right ms-2"></i>
            </button>
          </div>
        </Container>
      </section>
      <section className="home-testimonials-section" id="testimonios">
        <Container>
          <div className="home-section-header">
            <h2 className="home-section-title">
              Testimonios de <span className="text-accent">Clientes</span>
            </h2>
            <p className="home-section-subtitle">
              Lo que dicen nuestros clientes sobre nuestro servicio.
            </p>
          </div>

          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-icon">
                <i className="bi bi-quote"></i>
              </div>
              <p className="testimonial-text">
                "Excelente atención y rapidez en el servicio. El equipo es muy profesional y te explican todo detalladamente."
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">
                  <i className="bi bi-person-fill"></i>
                </div>
                <div className="author-info">
                  <h4>Bautista Calvo</h4>
                  <div className="author-rating">
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-icon">
                <i className="bi bi-quote"></i>
              </div>
              <p className="testimonial-text">
                "Muy profesional, lo recomiendo totalmente. Precios justos y trabajo de calidad. Siempre vuelvo acá."
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">
                  <i className="bi bi-person-fill"></i>
                </div>
                <div className="author-info">
                  <h4>Franco Jimenez</h4>
                  <div className="author-rating">
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-icon">
                <i className="bi bi-quote"></i>
              </div>
              <p className="testimonial-text">
                "Volveré sin dudas. El mejor servicio de lubricentro que encontré en la zona. Muy recomendable."
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">
                  <i className="bi bi-person-fill"></i>
                </div>
                <div className="author-info">
                  <h4>Federico Borsi</h4>
                  <div className="author-rating">
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}