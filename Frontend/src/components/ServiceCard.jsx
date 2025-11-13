import PropTypes from 'prop-types';
import { Badge } from 'react-bootstrap';
import '../assets/styles/serviceCard.css';

export default function ServiceCard({ 
  icon, 
  name, 
  description, 
  duration, 
  features = [],
  onReserve 
}) {
  return (
    <div className="service-card">
      <div className="service-card-header">
        <div className="service-icon">
          <i className={icon}></i>
        </div>
        <Badge bg="warning" text="dark" className="service-badge">
          <i className="bi bi-star-fill me-1"></i>
          Servicio Oficial
        </Badge>
      </div>

      <div className="service-card-body">
        <h3 className="service-title">{name}</h3>
        
        <p className="service-description">{description}</p>

        {duration && (
          <div className="service-duration">
            <i className="bi bi-clock-fill me-2"></i>
            <span>Tiempo estimado: <strong>{duration}</strong></span>
          </div>
        )}

        {features.length > 0 && (
          <div className="service-features">
            <p className="features-title">Incluye:</p>
            <ul className="features-list">
              {features.map((feature, index) => (
                <li key={index}>
                  <i className="bi bi-check-circle-fill me-2"></i>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button 
          className="btn-service-reserve"
          onClick={onReserve}
        >
          <i className="bi bi-calendar-check me-2"></i>
          Consultar y Reservar
        </button>
      </div>
    </div>
  );
}

ServiceCard.propTypes = {
  icon: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  duration: PropTypes.string,
  features: PropTypes.arrayOf(PropTypes.string),
  onReserve: PropTypes.func
};

ServiceCard.defaultProps = {
  onReserve: () => {}
};

