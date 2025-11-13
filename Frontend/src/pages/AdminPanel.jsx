import { useState, useEffect } from 'react';
import { Alert, Row, Col, Card, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { usarAuth } from '../context/AuthContext';
import { useApiQuery } from '../hooks/useApi';
import apiService from '../services/apiService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBoundary from '../components/ErrorBoundary';
import { formatearFechaParaMostrar } from '../utils/dateUtils';
import '../assets/styles/admin.css';

export default function AdminPanel() {
  const { usuario } = usarAuth();
  const esAdmin = usuario?.rol === 'ADMIN';

  const { data: reservas, isLoading: isLoadingReservas } = useApiQuery(
    ['reservas', 'admin'],
    () => apiService.getReservations(null, true),
    {
      enabled: esAdmin,
      select: (data) => data?.data?.reservations
    }
  );

  const { data: usuarios, isLoading: isLoadingUsuarios } = useApiQuery(
    ['usuarios', 'admin'],
    () => apiService.getAllUsers(),
    {
      enabled: esAdmin,
      select: (data) => data?.data
    }
  );

  const [estadisticas, setEstadisticas] = useState({
    totalReservas: 0,
    reservasPendientes: 0,
    reservasConfirmadas: 0,
    reservasCanceladas: 0,
    reservasCompletadas: 0,
    totalUsuarios: 0
  });

  useEffect(() => {
    if (!reservas || !usuarios) {
      return;
    }
    
    const stats = {
      totalReservas: reservas.length,
      reservasPendientes: reservas.filter(r => r.status === 'PENDING').length,
      reservasConfirmadas: reservas.filter(r => r.status === 'CONFIRMED').length,
      reservasCanceladas: reservas.filter(r => r.status === 'CANCELLED').length,
      reservasCompletadas: reservas.filter(r => r.status === 'COMPLETED').length,
      totalUsuarios: usuarios.length
    };
    setEstadisticas(stats);
  }, [reservas, usuarios]);

  const isLoading = isLoadingReservas || isLoadingUsuarios;
  const reservasParaMostrar = reservas || [];

  return (
    <ErrorBoundary>
      <div className="admin-container">
        <div className="admin-info-card">
          <h3>
            <i className="bi bi-person-badge me-2"></i>
            Administrador Conectado
          </h3>
          <Row>
            <Col md={6}>
              <p><strong>Nombre:</strong> {usuario?.nombre} {usuario?.apellido}</p>
              <p><strong>Email:</strong> {usuario?.email}</p>
            </Col>
            <Col md={6}>
              <p><strong>Rol:</strong> 
                <Badge bg="warning" className="ms-2">Administrador</Badge>
              </p>
              <p><strong>Último acceso:</strong> {new Date().toLocaleString('es-ES')}</p>
            </Col>
          </Row>
        </div>

        <div className="admin-estadisticas-rapidas">
          <div className="admin-stat-card">
            <h3>Total Reservas</h3>
            <p className="admin-stat-numero">{isLoading ? '...' : estadisticas.totalReservas}</p>
          </div>
          <div className="admin-stat-card">
            <h3>Pendientes</h3>
            <p className="admin-stat-numero pendiente">{isLoading ? '...' : estadisticas.reservasPendientes}</p>
          </div>
          <div className="admin-stat-card">
            <h3>Completadas</h3>
            <p className="admin-stat-numero confirmado">{isLoading ? '...' : estadisticas.reservasCompletadas}</p>
          </div>
          <div className="admin-stat-card">
            <h3>Canceladas</h3>
            <p className="admin-stat-numero cancelado">{isLoading ? '...' : estadisticas.reservasCanceladas}</p>
          </div>
        </div>

        <div className="admin-acciones-rapidas">
          <h3>
            <i className="bi bi-lightning me-2"></i>
            Acciones Rápidas
          </h3>
          <Row>
            <Col md={3}>
              <Card className="admin-accion-card">
                <Link to="/reservas">
                  <i className="bi bi-calendar-event"></i>
                  <h5 className="mt-2">Turnos del Día</h5>
                </Link>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="admin-accion-card">
                <Link to="/gestion-reservas">
                  <i className="bi bi-calendar-event"></i>
                  <h5 className="mt-2">Gestionar Reservas</h5>
                </Link>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="admin-accion-card">
                <Link to="/gestion-usuarios">
                  <i className="bi bi-people"></i>
                  <h5 className="mt-2">Gestionar Usuarios</h5>
                </Link>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="admin-accion-card">
                <Link to="/gestion-vehiculos">
                  <i className="bi bi-car-front-fill"></i>
                  <h5 className="mt-2">Gestionar Vehiculos</h5>
                </Link>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="admin-accion-card">
                <Link to="/crear-servicio">
                  <i className="bi bi-tools"></i>
                  <h5 className="mt-2">Crear Servicio</h5>
                </Link>
              </Card>
            </Col>
          </Row>
        </div>

        <div className="admin-main-content">
          {isLoading && <LoadingSpinner />}

          {!isLoading && (
            <>
              <div className="admin-card">
                <div className="admin-card-header">
                  <h3>
                    <i className="bi bi-calendar-check me-2"></i>
                    Últimas Reservas
                  </h3>
                </div>
                {reservasParaMostrar.length > 0 ? (
                  <div className="admin-lista-reservas">
                    {[...reservasParaMostrar]
                      .sort((a, b) => new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`))
                      .slice(0, 5)
                      .map(reserva => (
                      <div key={reserva.id} className="admin-reserva-card">
                        <div className="admin-reserva-header">
                          <div className="admin-reserva-hora">
                            <strong>{formatearFechaParaMostrar(reserva.date)} - {reserva.time}</strong>
                          </div>
                          <div className="admin-reserva-estado">
                            <Badge bg={
                              reserva.status === 'CONFIRMED' ? 'success' :
                              reserva.status === 'PENDING' ? 'warning' :
                              reserva.status === 'CANCELLED' ? 'danger' : 'secondary'
                            }>
                              {reserva.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="admin-reserva-info">
                          <div className="admin-cliente-info">
                            <h4>{reserva.service?.name || 'Servicio no especificado'}</h4>
                            <p><strong>Cliente:</strong> {reserva.user?.name || 'N/A'}</p>
                            <p><strong>Vehículo:</strong> {reserva.vehicle?.license || 'N/A'} - {reserva.vehicle?.brand || 'N/A'} {reserva.vehicle?.model || 'N/A'}</p>
                            {reserva.notes && (
                              <p><strong>Observaciones:</strong> {reserva.notes}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Alert variant="info" className="admin-alert info">
                    <i className="bi bi-info-circle me-2"></i>
                    No hay reservas registradas en el sistema.
                  </Alert>
                )}
              </div>

              <div className="admin-sistema-info">
                <h6>
                  <i className="bi bi-info-circle me-2"></i>
                  Información del Sistema
                </h6>
                <ul>
                  <li>Versión del sistema: 1.0.0</li>
                  <li>Última actualización de datos: {new Date().toLocaleString('es-ES')}</li>
                  <li>Estado del sistema: Operativo</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}