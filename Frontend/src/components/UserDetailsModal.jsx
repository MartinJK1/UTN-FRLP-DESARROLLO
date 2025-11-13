import { Modal, Button, Row, Col, Badge, Accordion } from 'react-bootstrap';
import { formatearFechaParaMostrar } from '../utils/dateUtils';
import { useApiQuery } from '../hooks/useApi';
import apiService from '../services/apiService';
import { useState } from 'react';
import '../assets/styles/modalEdicion.css';

export default function UserDetailsModal({ show, onHide, usuario }) {
  const [mostrarReservas, setMostrarReservas] = useState(false);

  // Obtiene las reservas del usuario
  const { data: reservasUsuario = [], isLoading: isLoadingReservas } = useApiQuery(
    ['reservasUsuario', usuario?.id],
    () => apiService.getReservationsByUserId(usuario.id),
    {
      enabled: !!show && !!usuario?.id,
      select: (data) => (data?.data?.reservations || []).sort((a, b) => new Date(b.date) - new Date(a.date))
    }
  );

  // Obtiene los vehículos activos del usuario
  const { data: vehiculosUsuario = [], isLoading: isLoadingVehiculos } = useApiQuery(
    ['vehiculosUsuario', usuario?.id],
    () => apiService.getVehicles(usuario.id),
    {
      enabled: !!show && !!usuario?.id,
      select: (data) => (data?.data || []).filter(v => v.status === 'ACTIVE')
    }
  );

  if (!usuario) return null;

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Obtiene el color del badge según el estado
  const obtenerColorEstado = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'confirmed': case 'confirmado': return 'success';
      case 'pending': case 'pendiente': return 'warning';
      case 'cancelled': case 'cancelado': return 'danger';
      case 'completed': case 'completado': return 'info';
      default: return 'secondary';
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered className="modal-edicion .modal-content">
      <Modal.Header closeButton className="modal-edicion-header">
        <Modal.Title className="modal-edicion-title">
          <i className="bi bi-person-circle me-2"></i>
          Detalles del Usuario
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="modal-edicion-body">
        <div className="modal-edicion-seccion">
          <h5 className="modal-edicion-seccion-titulo">
            <i className="bi bi-person me-2"></i>
            Información Personal
          </h5>
          <Row>
            <Col md={6}>
              <div className="modal-edicion-info-personal">
                <p><strong>Nombre completo:</strong> {usuario.name}</p>
                <p><strong>Email:</strong> {usuario.email}</p>
                <p><strong>Teléfono:</strong> {usuario.phone || 'N/A'}</p>
              </div>
            </Col>
            <Col md={6}>
              <div className="modal-edicion-info-personal">
                <p><strong>ID Usuario:</strong> {usuario.id}</p>
                <p><strong>Fecha de registro:</strong> {formatearFechaParaMostrar(usuario.createdAt)}</p>
                <p>
                  <strong>Rol:</strong> 
                  <Badge bg={usuario.role === 'ADMIN' ? 'danger' : 'success'} className="ms-2">
                    {usuario.role === 'ADMIN' ? 'Administrador' : 'Cliente'}
                  </Badge>
                </p>
              </div>
            </Col>
          </Row>
        </div>

        <div className="modal-edicion-seccion">
          <h5 className="modal-edicion-seccion-titulo">
            <i className="bi bi-car-front me-2"></i>
            Vehículos Activos ({vehiculosUsuario.length})
          </h5>
          {isLoadingVehiculos ? (
            <div className="text-center py-2">
              <div className="spinner-border spinner-border-sm text-warning" role="status"></div>
            </div>
          ) : vehiculosUsuario.length > 0 ? (
            <div className="modal-edicion-vehiculos-container">
              {vehiculosUsuario.map(vehiculo => (
                <div key={vehiculo.id} className="modal-edicion-vehiculo-item">
                  <i className="bi bi-car-front-fill me-2" style={{ color: 'var(--color-acento)' }}></i>
                  <span className="modal-edicion-vehiculo-patente">{vehiculo.license}</span>
                  <span className="text-muted">-</span>
                  <span>{vehiculo.model}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="modal-edicion-texto-muted">No tiene vehículos activos registrados</p>
          )}
        </div>

        <div className="modal-edicion-seccion">
          <h5 className="modal-edicion-seccion-titulo">
            <i className="bi bi-calendar-check me-2"></i>
            Historial de Reservas
          </h5>

          <Button 
            variant="outline-info" 
            size="sm" 
            className="modal-edicion-boton-historial-modal mb-3"
            onClick={() => setMostrarReservas(!mostrarReservas)}
          >
            <i className="bi bi-calendar-check me-2"></i>
            {mostrarReservas ? 'Ocultar' : 'Ver'} historial de reservas
          </Button>

          {mostrarReservas && (
            <div className="historial-servicios-container">
              {isLoadingReservas ? (
                <div className="text-center py-3">
                  <div className="spinner-border text-warning" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                </div>
              ) : reservasUsuario.length > 0 ? (
                <>
                  <p className="mb-3 historial-info-text">
                    <i className="bi bi-info-circle me-1"></i>
                    Total de reservas: <strong>{reservasUsuario.length}</strong>
                  </p>

                  <Accordion>
                    {reservasUsuario.map((reserva, index) => (
                      <Accordion.Item 
                        eventKey={index.toString()} 
                        key={reserva.id}
                        className="historial-accordion-item"
                      >
                        <Accordion.Header className="historial-accordion-header">
                          <div className="historial-header-content">
                            <div className="historial-servicio-nombre">
                              <i className="bi bi-gear-fill me-2"></i>
                              {reserva.service?.name}
                            </div>
                            <div className="historial-fecha-badge">
                              <i className="bi bi-calendar3 me-1"></i>
                              {formatearFecha(reserva.date)}
                            </div>
                          </div>
                        </Accordion.Header>
                        <Accordion.Body className="historial-accordion-body">
                          <div className="historial-detalle-grid">
                            <div className="historial-detalle-item">
                              <i className="bi bi-clock me-2"></i>
                              <div>
                                <strong>Hora:</strong>
                                <span>{reserva.time}</span>
                              </div>
                            </div>

                            <div className="historial-detalle-item">
                              <i className="bi bi-info-circle me-2"></i>
                              <div>
                                <strong>Estado:</strong>
                                <span>
                                  <Badge bg={obtenerColorEstado(reserva.status?.toLowerCase())} className="ms-1">
                                    {reserva.status === 'CONFIRMED' ? 'Confirmado' : 
                                     reserva.status === 'PENDING' ? 'Pendiente' : 
                                     reserva.status === 'CANCELLED' ? 'Cancelado' : 
                                     reserva.status === 'COMPLETED' ? 'Completado' : reserva.status}
                                  </Badge>
                                </span>
                              </div>
                            </div>

                            {reserva.vehicle && (
                              <div className="historial-detalle-item full-width">
                                <i className="bi bi-car-front me-2"></i>
                                <div>
                                  <strong>Vehículo:</strong>
                                  <span>{reserva.vehicle.license} - {reserva.vehicle.brand} {reserva.vehicle.model}</span>
                                </div>
                              </div>
                            )}

                            {reserva.notes && (
                              <div className="historial-detalle-item full-width">
                                <i className="bi bi-chat-left-text me-2"></i>
                                <div>
                                  <strong>Observaciones:</strong>
                                  <span>{reserva.notes}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </Accordion.Body>
                      </Accordion.Item>
                    ))}
                  </Accordion>
                </>
              ) : (
                <div className="modal-edicion-reservas-vacio">
                  <i className="bi bi-inbox"></i>
                  <p>Este usuario no tiene reservas registradas</p>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal.Body>
      
      <Modal.Footer className="modal-edicion-footer">
        <Button className="modal-edicion-boton-cerrar" onClick={onHide}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
} 