import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Container, Nav, Dropdown } from 'react-bootstrap';
import { usarAuth } from '../context/AuthContext';
import '../assets/styles/navbar.css';

export default function NavbarComponent({ showBrand = true, style: inlineStyle = {} }) {
  const { usuario, cerrarSesion, estaAutenticado, cargando } = usarAuth();
  const navigate = useNavigate();

  const isLoggedIn = estaAutenticado;
  const isAdmin = usuario?.rol === 'ADMIN';

  if (cargando) {
    return (
      <Navbar expand="lg" className="py-3 app-navbar" style={inlineStyle}>
        <Container fluid>
          <Navbar.Brand as={Link} to="/" className="app-navbar__brand">
            <img src="/renault-logo.png" alt="Lubricentro Renault logo" className="app-navbar__logo" />
            {showBrand && <span className="app-navbar__company-name">Lubricentro Renault</span>}
          </Navbar.Brand>
        </Container>
      </Navbar>
    );
  }

  return (
    <Navbar expand="lg" className="py-3 app-navbar" role="navigation" aria-label="Main navigation" style={inlineStyle}>
      <Container fluid>
        <div className="app-navbar__left">
          <Navbar.Brand as={Link} to="/" className="app-navbar__brand">
            <img
              src="/renault-logo.png"
              alt="Lubricentro Renault logo"
              className="app-navbar__logo"
            />
            {showBrand && (
              <span className="app-navbar__company-name" data-show-brand>
                Lubricentro Renault
              </span>
            )}
          </Navbar.Brand>
        </div>

        <Navbar.Collapse id="navbar-nav">
          <div className="app-navbar__center">
            <ul className="app-navbar__links">
              <li className="nav-item"><Link to="/">Inicio</Link></li>
              <li className="nav-item"><Link to="/servicios">Servicios</Link></li>
              <li className="nav-item"><Link to="/productos">Productos</Link></li>
              <li className="nav-item"><Link to="/contacto">Contacto</Link></li>
              {isLoggedIn && (
                <li className="nav-item nav-item--reservar" data-show-logged-in>
                  <Link to="/reservar">Reservar Turno</Link>
                </li>
              )}
            </ul>
          </div>

          <div className="app-navbar__right">
          {isLoggedIn && isAdmin && (
              <Link to="/admin" className="app-navbar__admin-link" aria-label="Panel de control">
                <i className="bi bi-gear me-2"></i>
                Panel de control
              </Link>
            )}
            {isLoggedIn ? (
              <Dropdown align="end" className="nav-user">
                <Dropdown.Toggle id="dropdown-usuario" className="nav-user__toggle" variant="outline-light" aria-haspopup="true">
                  <i className="bi bi-person-circle me-2"></i>
                  {usuario?.nombre || 'Mi Cuenta'}
                </Dropdown.Toggle>
                <Dropdown.Menu className="nav-user__menu" role="menu">
                  <Dropdown.Item as={Link} to="/mi-perfil" role="menuitem">
                    <i className="bi bi-person me-2"></i>
                    Mi Perfil
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/mis-vehiculos" role="menuitem">
                    <i className="bi bi-car-front me-2"></i>
                    Mis Vehículos
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/mis-reservas" role="menuitem">
                    <i className="bi bi-calendar-check me-2"></i>
                    Mis Reservas
                  </Dropdown.Item>
                  {isAdmin && (
                    <>
                      <Dropdown.Divider />
                      <Dropdown.Item as={Link} to="/reservas" role="menuitem">
                        <i className="bi bi-calendar-event me-2"></i>
                        Turnos de Hoy
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/gestion-reservas" role="menuitem">
                        <i className="bi bi-funnel me-2"></i>
                        Gestión de Reservas
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/gestion-vehiculos" role="menuitem">
                        <i className="bi bi-car-front me-2"></i>
                        Gestión de Vehículos
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/gestion-usuarios" role="menuitem">
                        <i className="bi bi-people me-2"></i>
                        Gestión de Usuarios
                      </Dropdown.Item>
                    </>
                  )}
                  <Dropdown.Divider />
                  <Dropdown.Item
                    role="menuitem"
                    onClick={() => {
                      cerrarSesion();
                      navigate('/login');
                    }}
                  >
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Cerrar Sesión
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <div className="auth-actions" data-show-logged-out>
                <Link className="btn btn--link" to="/login">Iniciar sesión</Link>
                <Link className="btn btn--primary" to="/registro">Registrarse</Link>
              </div>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}