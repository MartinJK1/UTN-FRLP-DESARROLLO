import { Modal, Button, Accordion } from 'react-bootstrap';
import { useState } from 'react';
import { useApiQuery } from '../hooks/useApi';
import apiService from '../services/apiService';
import '../assets/styles/modalEdicion.css';

export default function VehicleDetailsModal({ show, onHide, vehiculo }) {
  const [mostrarHistorial, setMostrarHistorial] = useState(false);

  // Obtiene el historial de servicios del vehículo
  const { data: historialServicios = [], isLoading: isLoadingHistorial } = useApiQuery(
    ['historialVehiculo', vehiculo?.license],
    () => apiService.getServiceHistory(vehiculo?.license?.toUpperCase()),
    {
      enabled: !!show && !!vehiculo?.license,
      select: (data) => {
        const historialData = data?.data || [];
        return historialData.filter(servicio => 
          servicio.resultado?.toUpperCase() === 'COMPLETADO'
        );
      }
    }
  );

  if (!vehiculo) return null;

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered className="modal-edicion .modal-content">
      <Modal.Header closeButton className="modal-edicion-header">
        <Modal.Title className="modal-edicion-title">
          <i className="bi bi-car-front me-2"></i>
          Detalle de Vehículo
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="modal-edicion-body">
        <div className="modal-edicion-detalle-vehiculo">
          <h5>Datos del Vehículo</h5>
          <ul>
            <li><b>Patente:</b><span>{vehiculo.license}</span></li>
            <li><b>Marca:</b><span>{vehiculo.brand}</span></li>
            <li><b>Modelo:</b><span>{vehiculo.model}</span></li>
            <li><b>Año:</b><span>{vehiculo.year || '-'}</span></li>
            {vehiculo.color && (
              <li><b>Color:</b><span>{vehiculo.color}</span></li>
            )}
            <li><b>Estado:</b><span>{vehiculo.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}</span></li>
          </ul>
        </div>

        <div className="modal-edicion-detalle-dueno">
          <h5>Dueño Actual</h5>
          {vehiculo.user ? (
          <ul>
            <li><b>Nombre:</b><span>{vehiculo.user.name}</span></li>
            <li><b>Email:</b><span>{vehiculo.user.email}</span></li>
            <li><b>Teléfono:</b><span>{vehiculo.user.phone || 'N/A'}</span></li>
          </ul>
          ) : (
            <p className="modal-edicion-texto-muted">No se encontró el usuario vinculado.</p>
          )}
        </div>

        <div className="modal-edicion-seccion">
          <h5 className="modal-edicion-seccion-titulo">
            <i className="bi bi-clock-history me-2"></i>
            Historial de Servicios
          </h5>

          <Button 
            variant="outline-info" 
            size="sm" 
            className="modal-edicion-boton-historial-modal mb-3"
            onClick={() => setMostrarHistorial(!mostrarHistorial)}
          >
            <i className="bi bi-clock-history me-2"></i>
            {mostrarHistorial ? 'Ocultar' : 'Ver'} servicios completados
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
        <Button variant="secondary" onClick={onHide} className="modal-edicion-boton-cerrar">
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
