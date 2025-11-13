import { Card, Table, Badge, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApiQuery } from '../hooks/useApi';
import apiService from '../services/apiService';
import '../assets/styles/historialvehiculo.css';

export default function HistorialVehiculo() {
  const navigate = useNavigate();
  const location = useLocation();
  const patente = location.state?.patente;

  // Obtiene el historial del vehículo
  const { 
    data: historialResponse, 
    isLoading: isLoadingHistorial, 
    isError: isErrorHistorial,
    error: errorHistorial
  } = useApiQuery(
    ['historialVehiculo', patente],
    () => apiService.getServiceHistory(patente),
    {
      enabled: !!patente
    }
  );
  const historial = historialResponse?.data || [];
  const vehiculoInfo = historialResponse?.vehiculo;

  // Obtiene las estadísticas del vehículo
  const { 
    data: statsResponse, 
    isLoading: isLoadingStats, 
    isError: isErrorStats
  } = useApiQuery(
    ['statsVehiculo', patente],
    () => apiService.getServiceHistoryStats({ patente }),
    {
      enabled: !!patente
    }
  );
  const estadisticas = statsResponse?.data;

  if (!patente) {
    return (
       <div className="historialvehiculo-container">
        <Alert variant="warning">No se ha especificado una patente de vehículo.</Alert>
         <Button variant="secondary" onClick={() => navigate(-1)}>Volver</Button>
      </div>
    );
  }

  return (
    <div className="historialvehiculo-container">
      <div className="historialvehiculo-header">
        <h1>Historial de Servicios</h1>
        <div className="historialvehiculo-botones">
            <Button variant="secondary" className="historialvehiculo-boton-volver" onClick={() => navigate(-1)}>
              <i className="bi bi-arrow-left me-2"></i>
              Volver
            </Button>
        </div>
        
        <p style={{ margin: '1rem' }}>Vehículo: <strong>{patente}</strong></p>
        {vehiculoInfo && (
          <p className="historialvehiculo-info-vehiculo" style={{ marginBottom: '-1rem', marginTop: '-1rem' }}>
            {vehiculoInfo.marca} {vehiculoInfo.modelo} ({vehiculoInfo.año})
          </p>
        )}
      </div>
      {isLoadingStats ? (
        <div className="text-center"><Spinner animation="grow" size="sm" /> Cargando estadísticas...</div>
      ) : estadisticas && (
        <Row className="mb-4">
          <Col md={3}>
            <Card className="historialvehiculo-stat-card">
              <Card.Body className="text-center">
                <h5 className="historialvehiculo-stat-number">{estadisticas.totalServicios}</h5>
                <p className="historialvehiculo-stat-label">Total Servicios</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="historialvehiculo-stat-card">
              <Card.Body className="text-center">
                <h5 className="historialvehiculo-stat-number text-success">{estadisticas.serviciosCompletados}</h5>
                <p className="historialvehiculo-stat-label">Completados</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="historialvehiculo-stat-card">
              <Card.Body className="text-center">
                <h5 className="historialvehiculo-stat-number text-warning">{estadisticas.serviciosPendientes}</h5>
                <p className="historialvehiculo-stat-label">Pendientes</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="historialvehiculo-stat-card">
              <Card.Body className="text-center">
                <h5 className="historialvehiculo-stat-number text-info">{estadisticas.porcentajeCompletados}%</h5>
                <p className="historialvehiculo-stat-label">Eficiencia</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
      {isLoadingHistorial && (
        <div className="historialvehiculo-spinner-container">
          <Spinner animation="border" role="status" className="historialvehiculo-spinner">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
          <p className="historialvehiculo-spinner-text">Cargando historial del vehículo...</p>
        </div>
      )}
      {isErrorHistorial && (
        <Alert variant="danger" className="historialvehiculo-alert-error">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Error al cargar el historial: {errorHistorial.message}
        </Alert>
      )}
      {!isLoadingHistorial && !isErrorHistorial && (
        <Card className="historialvehiculo-card">
          <Card.Header className="historialvehiculo-card-header">
            <i className="bi bi-clock-history me-2"></i>
            Historial de Servicios - {patente}
          </Card.Header>
          <Card.Body className="historialvehiculo-card-body">
            {historial.length === 0 ? (
              <div className="historialvehiculo-sin-servicios">
                <i className="bi bi-inbox historialvehiculo-icono-vacio"></i>
                <p className="historialvehiculo-mensaje-vacio">No hay servicios registrados para este vehículo.</p>
                <small className="historialvehiculo-submensaje-vacio">Los servicios aparecerán aquí una vez que sean registrados por el mecánico.</small>
              </div>
            ) : (
              <div className="historialvehiculo-tabla-container">
                <Table striped bordered hover responsive className="historialvehiculo-tabla">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Hora</th>
                      <th>Servicio</th>
                      <th>Resultado</th>
                      <th>Mecánico</th>
                      <th>Kilometraje</th>
                      <th>Observaciones</th>
                      <th>Repuestos</th>
                      <th>Cliente</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historial.map((servicio, idx) => (
                      <tr key={servicio.id || idx}>
                        <td>{servicio.fecha}</td>
                        <td>{servicio.hora}</td>
                        <td className="historialvehiculo-servicio">{servicio.servicio}</td>
                        <td>
                          <Badge className={`historialvehiculo-badge-${servicio.resultado === 'Completado' ? 'completado' : 
                                    servicio.resultado === 'Pendiente' ? 'pendiente' : 
                                    servicio.resultado === 'Cancelado' ? 'cancelado' : 'info'}`}>
                            {servicio.resultado}
                          </Badge>
                        </td>
                        <td>{servicio.mecanico || 'N/A'}</td>
                        <td>{servicio.kilometraje ? `${servicio.kilometraje} km` : 'N/A'}</td>
                        <td className="historialvehiculo-observaciones">
                          {servicio.observaciones || 'Sin observaciones'}
                        </td>
                        <td className="historialvehiculo-repuestos">
                          <small>{servicio.repuestos || 'N/A'}</small>
                        </td>
                        <td>{servicio.cliente || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>
      )}
    </div>
  );
} 