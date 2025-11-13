import PropTypes from 'prop-types';
import { Card, Badge } from 'react-bootstrap';
import OptimizedImage from './OptimizedImage';
import '../assets/styles/productCard.css';

export default function ProductCard({ 
  image, 
  name, 
  category, 
  quantity, 
  description, 
  onConsult 
}) {
  return (
    <Card className="product-card">
      <div className="product-image-wrapper">
        <Badge bg="warning" text="dark" className="product-category-badge">
          {category}
        </Badge>
        <OptimizedImage
          src={image}
          alt={name}
          aspectRatio="4/3"
          objectFit="cover"
        />
      </div>
      
      <Card.Body className="product-card-body">
        <div className="product-quantity-badge">
          <i className="bi bi-box-seam me-1"></i>
          {quantity}
        </div>
        
        <h3 className="product-card-title">{name}</h3>
        
        <p className="product-card-description">{description}</p>
        
        <button 
          className="btn-product-consult"
          onClick={onConsult}
        >
          <i className="bi bi-chat-dots me-2"></i>
          Consultar Precio
        </button>
      </Card.Body>
    </Card>
  );
}

ProductCard.propTypes = {
  image: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  category: PropTypes.string.isRequired,
  quantity: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  onConsult: PropTypes.func
};

ProductCard.defaultProps = {
  onConsult: () => {}
};

