import { Container } from 'react-bootstrap';

export default function Footer() {
  return (
    <footer className="pie-pagina">
      <Container className="d-flex justify-content-between align-items-center">
        <p className="mb-0">&copy; 2025 Lubricentro Renault. Todos los derechos reservados.</p>
        <a href="#" className="text-light text-decoration-none">
          Términos y condiciones
        </a>
      </Container>
    </footer>
  );
}