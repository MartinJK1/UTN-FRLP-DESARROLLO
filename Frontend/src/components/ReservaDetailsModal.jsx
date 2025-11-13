import { Modal, Button, Row, Col, Badge, Accordion } from 'react-bootstrap';
import { formatearFechaParaMostrar } from '../utils/dateUtils';
import { useApiQuery } from '../hooks/useApi';
import apiService from '../services/apiService';
import { useState } from 'react';
import '../assets/styles/modalEdicion.css';

export default function ReservaDetailsModal({ show, onHide, reserva }) {
  const [mostrarHistorial, setMostrarHistorial] = useState(false);

  // Obtiene el historial del vehículo de la reserva
  const { data: historialResponse, isLoading: isLoadingHistorial } = useApiQuery(
    ['historialVehiculo', reserva?.vehicle?.license],
    () => apiService.getServiceHistory(reserva?.vehicle?.license?.toUpperCase()),
    {
      enabled: !!show && !!reserva?.vehicle?.license,
      select: (data) => {
        const historialData = data?.data || [];
        return historialData.filter(servicio => 
          servicio.resultado?.toUpperCase() === 'COMPLETADO'
        );
      }
    }
  );

  const historialServicios = historialResponse || [];

  if (!reserva) return null;

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Obtiene el color del badge según el estado de la reserva
  const obtenerColorEstado = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'danger';
      case 'completed': return 'info';
      default: return 'secondary';
    }
  };

  // Obtiene el texto traducido del estado
  const obtenerTextoEstado = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'confirmed': return 'Confirmado';
      case 'pending': return 'Pendiente';
      case 'cancelled': return 'Cancelado';
      case 'completed': return 'Completado';
      default: return estado || 'Desconocido';
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered className="modal-edicion .modal-content">
      <Modal.Header closeButton className="modal-edicion-header">
        <Modal.Title className="modal-edicion-title">
          <i className="bi bi-calendar-check me-2"></i>
          Detalles de la Reserva
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="modal-edicion-body">
        {/* Información de la reserva */}
        <div className="modal-edicion-seccion">
          <h5 className="modal-edicion-seccion-titulo">
            <i className="bi bi-calendar-event me-2"></i>
            Información de la Reserva
          </h5>
          <Row>
            <Col md={6}>
              <div className="modal-edicion-info-personal">
                <p><strong>Fecha:</strong> {formatearFechaParaMostrar(reserva.date)}</p>
                <p><strong>Hora:</strong> {reserva.time}</p>
                <p><strong>Servicio:</strong> {reserva.service?.name}</p>
              </div>
            </Col>
            <Col md={6}>
              <div className="modal-edicion-info-personal">
                <p><strong>Estado:</strong> 
                  <Badge bg={obtenerColorEstado(reserva.status)} className="ms-2">
                    {obtenerTextoEstado(reserva.status)}
                  </Badge>
                </p>
                <p><strong>ID Reserva:</strong> {reserva.id}</p>
                {reserva.createdAt && (
                  <p><strong>Fecha de creación:</strong> {formatearFechaParaMostrar(reserva.createdAt)}</p>
                )}
              </div>
            </Col>
          </Row>
        </div>

        {/* Información del cliente */}
        {reserva.user && (
          <div className="modal-edicion-seccion">
            <h5 className="modal-edicion-seccion-titulo">
              <i className="bi bi-person me-2"></i>
              Información del Cliente
            </h5>
            <Row>
              <Col md={6}>
                <div className="modal-edicion-info-personal">
                  <p><strong>Nombre completo:</strong> {reserva.user.name}</p>
                  <p><strong>Email:</strong> {reserva.user.email}</p>
                </div>
              </Col>
              <Col md={6}>
                <div className="modal-edicion-info-personal">
                  <p><strong>Teléfono:</strong> {reserva.user.phone}</p>
                  <p><strong>DNI:</strong> {reserva.user.dni || 'N/A'}</p>
                </div>
              </Col>
            </Row>
          </div>
        )}

        {/* Información del vehículo */}
        {reserva.vehicle && (
          <div className="modal-edicion-seccion">
            <h5 className="modal-edicion-seccion-titulo">
              <i className="bi bi-car-front me-2"></i>
              Información del Vehículo
            </h5>
            <Row>
              <Col md={6}>
                <div className="modal-edicion-info-personal">
                  <p><strong>Patente:</strong> {reserva.vehicle.license}</p>
                  <p><strong>Marca:</strong> {reserva.vehicle.brand}</p>
                </div>
              </Col>
              <Col md={6}>
                <div className="modal-edicion-info-personal">
                  <p><strong>Modelo:</strong> {reserva.vehicle.model}</p>
                  <p><strong>Año:</strong> {reserva.vehicle.year}</p>
                </div>
              </Col>
            </Row>
          </div>
        )}

        {/* Observaciones */}
        {reserva.notes && (
          <div className="modal-edicion-seccion">
            <h5 className="modal-edicion-seccion-titulo">
              <i className="bi bi-chat-text me-2"></i>
              Observaciones
            </h5>
            <div className="modal-edicion-info-personal">
              <p>{reserva.notes}</p>
            </div>
          </div>
        )}

        {/* Historial de Servicios del Vehículo */}
        <div className="modal-edicion-seccion">
          <h5 className="modal-edicion-seccion-titulo">
            <i className="bi bi-clock-history me-2"></i>
            Historial de Servicios - {reserva.vehicle?.license}
          </h5>
          
          <Button 
            variant="outline-info" 
            size="sm" 
            className="modal-edicion-boton-historial-modal mb-3"
            onClick={() => setMostrarHistorial(!mostrarHistorial)}
          >
            <i className="bi bi-clock-history me-2"></i>
            {mostrarHistorial ? 'Ocultar' : 'Ver'} historial de este vehículo
          </Button>

          {mostrarHistorial && (
            <div className="historial-servicios-container">
              {isLoadingHistorial ? (
                <div className="text-center py-3">
                  <div className="spinner-border text-warning" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                </div>
              ) : historialServicios.length > 0 ? (
                <>
                  <p className="mb-3 historial-info-text">
                    <i className="bi bi-info-circle me-1"></i>
                    Total de servicios completados: <strong>{historialServicios.length}</strong>
                  </p>

                  <Accordion>
                    {historialServicios.map((servicio, index) => (
                      <Accordion.Item 
                        eventKey={index.toString()} 
                        key={servicio.id}
                        className="historial-accordion-item"
                      >
                        <Accordion.Header className="historial-accordion-header">
                          <div className="historial-header-content">
                            <div className="historial-servicio-nombre">
                              <i className="bi bi-gear-fill me-2"></i>
                              {servicio.servicio}
                            </div>
                            <div className="historial-fecha-badge">
                              <i className="bi bi-calendar3 me-1"></i>
                              {formatearFecha(servicio.fecha)}
                            </div>
                          </div>
                        </Accordion.Header>
                        <Accordion.Body className="historial-accordion-body">
                          <div className="historial-detalle-grid">
                            <div className="historial-detalle-item">
                              <i className="bi bi-speedometer2 me-2"></i>
                              <div>
                                <strong>Kilometraje:</strong>
                                <span>{servicio.kilometraje?.toLocaleString('es-ES')} km</span>
                              </div>
                            </div>

                            <div className="historial-detalle-item">
                              <i className="bi bi-person-badge me-2"></i>
                              <div>
                                <strong>Mecánico:</strong>
                                <span>{servicio.mecanico || 'No especificado'}</span>
                              </div>
                            </div>

                            {servicio.observaciones && (
                              <div className="historial-detalle-item full-width">
                                <i className="bi bi-chat-left-text me-2"></i>
                                <div>
                                  <strong>Observaciones:</strong>
                                  <span>{servicio.observaciones}</span>
                                </div>
                              </div>
                            )}

                            {servicio.repuestos && (
                              <div className="historial-detalle-item full-width">
                                <i className="bi bi-tools me-2"></i>
                                <div>
                                  <strong>Repuestos utilizados:</strong>
                                  <span>{servicio.repuestos}</span>
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
                  <p>No hay servicios completados para este vehículo</p>
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
