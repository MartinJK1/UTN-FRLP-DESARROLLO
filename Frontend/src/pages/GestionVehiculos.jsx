import { useState } from 'react';
import { Form, Button, Card, Badge, Row, Col, Modal, Alert } from 'react-bootstrap';
import GestionTable from '../components/GestionTable';
import { usarAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useApiQuery, useApiMutation } from '../hooks/useApi';
import apiService from '../services/apiService';
import '../assets/styles/gestionvehiculos.css';
import '../assets/styles/modalEdicion.css';
import EditVehicleModal from '../components/EditVehicleModal';
import VehicleDetailsModal from '../components/VehicleDetailsModal';
import LoadingSpinner from '../components/LoadingSpinner';

export default function GestionVehiculos() {
  const [filtroPatente, setFiltroPatente] = useState('');
  const [vehiculoDetalle, setVehiculoDetalle] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [vehiculoEditar, setVehiculoEditar] = useState(null);
  const [vehiculoAEliminar, setVehiculoAEliminar] = useState(null);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const { usuario } = usarAuth();
  const navigate = useNavigate();

  const { data: vehiculos = [], isLoading, isError, error } = useApiQuery(
    ['vehiculos', 'admin'],
    () => apiService.getVehicles(null, null, true),
    {
      enabled: true,
      select: (data) => data.data || []
    }
  );

  const eliminarVehiculoMutation = useApiMutation(
    (id) => apiService.deleteVehicle(id),
    ['vehiculos', 'admin']
  );

  const actualizarVehiculoMutation = useApiMutation(
    (variables) => apiService.updateVehicle(variables.id, variables.data),
    ['vehiculos', 'admin']
  );

  const vehiculosFiltrados = vehiculos.filter(v => {
    if (!filtroPatente) return true;
    
    const terminoLower = filtroPatente.toLowerCase();
    return (
      (v.license && v.license.toLowerCase().includes(terminoLower)) ||
      (v.model && v.model.toLowerCase().includes(terminoLower)) ||
      (v.year && String(v.year).includes(filtroPatente)) ||
      (v.user?.name && v.user.name.toLowerCase().includes(terminoLower)) ||
      (v.user?.email && v.user.email.toLowerCase().includes(terminoLower))
    );
  });

  const handleEliminarVehiculo = (vehiculoId) => {
    const vehiculo = vehiculos.find(v => v.id === vehiculoId);
    setVehiculoAEliminar(vehiculo);
    setMostrarConfirmacion(true);
  };

  const handleActualizarVehiculo = async (vehiculoId, nuevosDatos) => {
    try {
      await actualizarVehiculoMutation.mutateAsync({ id: vehiculoId, data: nuevosDatos });
    } catch (err) {
      alert('Error al actualizar el vehículo: ' + (err.message || 'Error desconocido'));
    }
  };

  const confirmarEliminarVehiculo = async () => {
    if (!vehiculoAEliminar) return;
    try {
      await eliminarVehiculoMutation.mutateAsync(vehiculoAEliminar.id);
      setMostrarConfirmacion(false);
      setVehiculoAEliminar(null);
    } catch (err) {
      console.error("Error al eliminar el vehículo", err)
    }
  };

  if (isError) return <div className="gestionvehiculos-container"><Alert variant="danger">Error al cargar vehículos: {error.message}</Alert></div>;

  return (
    <div className="gestionvehiculos-container">
      <div className="gestionvehiculos-header">
        <h1>Gestión de Vehículos</h1>
        <p>Aquí puedes ver, buscar, y gestionar todos los vehículos registrados en el sistema.</p>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <Card className="gestionvehiculos-card-busqueda">
            <Card.Body>
              <Form>
                <Row>
                  <Col md={8}>
                    <Form.Group className="mb-3">
                      <Form.Label className="gestionvehiculos-form-label">
                        <i className="bi bi-search me-2"></i>
                        Buscar por patente, modelo, año o dueño
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={filtroPatente}
                        onChange={e => setFiltroPatente(e.target.value)}
                        placeholder="Ej: ABC123, Clio, 2020, Juan Pérez"
                        className="gestionvehiculos-form-control"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>
          <div className="gestionvehiculos-busqueda-vehiculos">
            <div className="gestionvehiculos-resultados-header">
              <h3 className="gestionvehiculos-resultados-titulo">
                <i className="bi bi-car-front me-2"></i>
                Resultados ({vehiculosFiltrados.length} vehículos)
              </h3>
              {filtroPatente && (
                <Badge bg="info" className="gestionvehiculos-badge-busqueda">
                  Buscando: "{filtroPatente}"
                </Badge>
              )}
            </div>

            <GestionTable
              columns={[
                { key: 'license', label: 'Patente', sortable: true, width: '140px' },
                { key: 'brand', label: 'Marca', sortable: true },
                { key: 'model', label: 'Modelo', sortable: true },
                { key: 'year', label: 'Año', sortable: true, width: '100px', getSortValue: (v) => Number(v.year) || 0 },
                { key: 'dueno', label: 'Dueño', sortable: true, getSortValue: (v) => `${(v.user?.name || '').toLowerCase()}`.trim(), render: (v) => v.user?.name || '-' },
                { key: 'email', label: 'Email', sortable: true, render: (v) => v.user?.email || '-' }
              ]}
              data={vehiculosFiltrados.map(v => ({ ...v, dueno: v.user }))}
              emptyMessage={filtroPatente ? `No se encontraron vehículos que coincidan con "${filtroPatente}"` : 'No hay vehículos registrados en el sistema'}
              renderActions={(v) => (
                <div className="gestionvehiculos-vehiculo-acciones">
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => { setVehiculoDetalle(v); setMostrarModal(true); }}
                    title="Ver Detalle"
                    className="gestionvehiculos-boton-accion gestionvehiculos-boton-ver"
                  >
                    <i className="bi bi-eye"></i>
                  </Button>
                  <Button 
                    variant="outline-info" 
                    size="sm"
                    onClick={() => {
                      navigate('/historial-vehiculo', { state: { patente: v.license } });
                    }}
                    title="Ver Historial"
                    className="gestionvehiculos-boton-accion gestionvehiculos-boton-historial"
                  >
                    <i className="bi bi-clock-history"></i>
                  </Button>
                  {usuario?.rol === 'ADMIN' && (
                    <>
                      <Button
                        variant="outline-warning"
                        size="sm"
                        onClick={() => setVehiculoEditar(v)}
                        title="Modificar vehículo"
                        className="gestionvehiculos-boton-accion gestionvehiculos-boton-editar"
                      >
                        <i className="bi bi-pencil"></i>
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleEliminarVehiculo(v.id)}
                        title="Eliminar vehículo"
                        className="gestionvehiculos-boton-accion gestionvehiculos-boton-eliminar"
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    </>
                  )}
                </div>
              )}
            />
          </div>
        </>
      )}
      <VehicleDetailsModal
        show={mostrarModal}
        onHide={() => setMostrarModal(false)}
        vehiculo={vehiculoDetalle}
      />
      <EditVehicleModal
        show={!!vehiculoEditar}
        vehiculo={vehiculoEditar}
        onHide={() => setVehiculoEditar(null)}
        onSave={async (nuevosDatos) => {
          await handleActualizarVehiculo(vehiculoEditar.id, nuevosDatos);
          setVehiculoEditar(null);
        }}
      />
      <Modal show={mostrarConfirmacion} onHide={() => setMostrarConfirmacion(false)} centered>
        <Modal.Header closeButton className="modal-edicion-header">
          <Modal.Title className="modal-edicion-title">
            <i className="bi bi-exclamation-triangle me-2"></i>
            Confirmar Eliminación
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-edicion-body">
          ¿Estás seguro de que quieres eliminar el vehículo <b>{vehiculoAEliminar?.license}</b>? Esta acción no se puede deshacer.
        </Modal.Body>
        <Modal.Footer className="modal-edicion-footer">
          <Button variant="secondary" onClick={() => setMostrarConfirmacion(false)} className="modal-edicion-boton-cerrar">
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmarEliminarVehiculo}>
            <i className="bi bi-trash me-2"></i>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}