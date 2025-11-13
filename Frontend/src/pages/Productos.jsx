import { useNavigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import ProductCard from '../components/ProductCard';
import '../assets/styles/productos.css';

export default function Productos() {
  const navigate = useNavigate();

  // Datos de productos estáticos
  const productos = [
    {
      id: 1,
      name: 'Aceite Sintético Premium',
      category: 'Aceites',
      quantity: '5 Litros',
      description: 'Aceite sintético de alto rendimiento ideal para motores Renault. Máxima protección y rendimiento en condiciones extremas.',
      image: '/aceite-premium.webp'
    },
    {
      id: 2,
      name: 'Filtro de Aceite Original',
      category: 'Filtros',
      quantity: 'Unidad',
      description: 'Filtros originales Renault que garantizan la pureza del aceite del motor. Máxima eficiencia de filtrado.',
      image: '/filtro-aceite-original-renault.webp'
    },
    {
      id: 3,
      name: 'Bujías de Encendido',
      category: 'Bujías',
      quantity: 'Set de 4',
      description: 'Bujías de encendido de alto rendimiento para una combustión perfecta. Mayor durabilidad y eficiencia.',
      image: '/bujias-encendido-renault-ngk.webp'
    },
    {
      id: 4,
      name: 'Aceite Motor 5W-30',
      category: 'Aceites',
      quantity: '4 Litros',
      description: 'Aceite semisintético para uso urbano y carretera. Excelente relación calidad-precio para el mantenimiento regular.',
      image: '/aceite-motor-5w30-renault.webp'
    },
    {
      id: 5,
      name: 'Filtro de Aire',
      category: 'Filtros',
      quantity: 'Unidad',
      description: 'Mejora la eficiencia del combustible y protege el motor de impurezas. Filtro de alta calidad original Renault.',
      image: '/filtro-aire-renault.webp'
    },
    {
      id: 6,
      name: 'Aceite Sintético Botella',
      category: 'Aceites',
      quantity: '1 Litro',
      description: 'Aceite sintético premium en presentación de 1 litro para complementos de mantenimiento.',
      image: '/aceite-sintetico.webp'
    },
    {
      id: 7,
      name: 'Aditivo Protector Motor',
      category: 'Aditivos',
      quantity: '500ml',
      description: 'Extiende la vida útil del motor protegiendo sus componentes internos. Reduce fricción y desgaste.',
      image: '/aditivo-motor.webp'
    },
    {
      id: 8,
      name: 'Kit Filtros Completo',
      category: 'Filtros',
      quantity: 'Kit x3',
      description: 'Kit completo con filtro de aceite, aire y combustible. Todo lo necesario para un service completo.',
      image: '/kit-filtros-completo.webp'
    },
    {
      id: 9,
      name: 'Aceite de Transmisión',
      category: 'Aceites',
      quantity: '2 Litros',
      description: 'Aceite especial para cajas de transmisión Renault. Garantiza cambios suaves y protección óptima.',
      image: '/aceite-transmision.webp'
    }
  ];

  const handleConsult = (productName) => {
    // Redirigir a contacto con el producto preseleccionado
    navigate('/contacto', { state: { product: productName } });
  };

  return (
    <main className="productos-page">
      <section className="productos-hero">
        <div className="productos-hero-overlay"></div>
        <Container className="productos-hero-content">
          <h1 className="productos-hero-title">
            Nuestros <span className="text-accent">Productos</span>
          </h1>
          <p className="productos-hero-subtitle">
            Disponemos de una amplia gama de aceites, filtros y aditivos para tu vehículo Renault. 
            Todos nuestros productos son originales y cuentan con garantía.
          </p>
        </Container>
      </section>
      <section className="productos-grid-section">
        <Container>
          <div className="productos-grid">
            {productos.map((producto, index) => (
              <div 
                key={producto.id} 
                className="producto-grid-item"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <ProductCard
                  image={producto.image}
                  name={producto.name}
                  category={producto.category}
                  quantity={producto.quantity}
                  description={producto.description}
                  onConsult={() => handleConsult(producto.name)}
                />
              </div>
            ))}
          </div>
        </Container>
      </section>
      <section className="productos-cta-section">
        <Container>
          <div className="productos-cta-box">
            <div className="productos-cta-icon">
              <i className="bi bi-question-circle-fill"></i>
            </div>
            <h2 className="productos-cta-title">¿No encontrás lo que buscás?</h2>
            <p className="productos-cta-text">
              Contactanos y te ayudaremos a encontrar el producto perfecto para tu vehículo Renault.
            </p>
            <button 
              className="btn-productos-cta"
              onClick={() => navigate('/contacto')}
            >
              <i className="bi bi-envelope-fill me-2"></i>
              Contactar Ahora
            </button>
          </div>
        </Container>
      </section>
    </main>
  );
}