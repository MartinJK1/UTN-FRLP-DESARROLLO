import { useState, useEffect } from 'react';
import { Modal, Button, Accordion, Badge } from 'react-bootstrap';
import apiService from '../services/apiService';
import LoadingSpinner from './LoadingSpinner';
import '../assets/styles/modalEdicion.css';

export default function VerHistorialModal({ show, onHide, patente, vehiculoInfo }) {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (show && patente) {
      fetchHistorial();
    }
  }, [show, patente]);

  const fetchHistorial = async () => {
    setLoading(true);
    setError(null);
    try {
      const patenteUpperCase = patente?.toUpperCase();
      const response = await apiService.getServiceHistory(patenteUpperCase);
      const historialData = response.data || [];
      const serviciosCompletados = historialData.filter(servicio => 
        servicio.resultado?.toUpperCase() === 'COMPLETADO'
      );
      setHistorial(serviciosCompletados);
    } catch (err) {
      console.error('Error al obtener historial:', err);
      setError('No se pudo cargar el historial de servicios');
      setHistorial([]);
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered className="modal-edicion">
      <Modal.Header closeButton className="modal-edicion-header">
        <Modal.Title className="modal-edicion-title">
          <i className="bi bi-clock-history me-2"></i>
          Historial de Servicios
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="modal-edicion-body">
        {vehiculoInfo && (
          <div className="modal-edicion-detalle-vehiculo">
            <h5>Vehículo</h5>
            <ul>
              <li><b>Patente:</b><span>{vehiculoInfo.patente || patente}</span></li>
              {vehiculoInfo.marca && <li><b>Marca:</b><span>{vehiculoInfo.marca}</span></li>}
              {vehiculoInfo.modelo && <li><b>Modelo:</b><span>{vehiculoInfo.modelo}</span></li>}
              {vehiculoInfo.año && <li><b>Año:</b><span>{vehiculoInfo.año}</span></li>}
            </ul>
          </div>
        )}

        {loading && (
          <div className="text-center py-4">
            <LoadingSpinner />
          </div>
        )}

        {error && (
          <div className="alert alert-danger">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {historial.length === 0 ? (
              <div className="modal-edicion-reservas-vacio">
                <i className="bi bi-inbox"></i>
                <p>No hay servicios completados registrados para este vehículo.</p>
              </div>
            ) : (
              <div className="historial-servicios-container">
                <p className="mb-3 historial-info-text">
                  <i className="bi bi-info-circle me-1"></i>
                  Total de servicios completados: <strong>{historial.length}</strong>
                </p>

                <Accordion>
                  {historial.map((servicio, index) => (
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
              </div>
            )}
          </>
        )}
      </Modal.Body>
      
      <Modal.Footer className="modal-edicion-footer">
        <Button variant="secondary" onClick={onHide} className="modal-edicion-boton-cerrar">
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

