import { useState } from 'react';
import { Button, Modal, Alert } from 'react-bootstrap';
import { usarAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import CustomButton from '../components/CustomButton';
import EditVehicleModal from '../components/EditVehicleModal';
import VerHistorialModal from '../components/VerHistorialModal';
import { useApiQuery, useApiMutation } from '../hooks/useApi';
import apiService from '../services/apiService';
import LoadingSpinner from '../components/LoadingSpinner';
import '../assets/styles/misvehiculos.css';

export default function MisVehiculos() {
  const { usuario } = usarAuth();
  const navigate = useNavigate();

  const { data: vehiculosResponse, isLoading, isError, error } = useApiQuery(
    ['vehiculos', usuario?.id],
    () => apiService.getVehicles(usuario.id),
    {
      enabled: !!usuario?.id, // Solo ejecutar si el usuario.id existe
    }
  );
  const vehiculos = vehiculosResponse?.data || [];
  
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [vehiculoAEliminar, setVehiculoAEliminar] = useState(null);
  const [mostrarExito, setMostrarExito] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [vehiculoModal, setVehiculoModal] = useState(null);
  const [modalHistorial, setModalHistorial] = useState({ show: false, patente: null, vehiculoInfo: null });

  const createVehicleMutation = useApiMutation(
    (data) => apiService.createVehicle(data),
    ['vehiculos', usuario?.id]
  );

  const updateVehicleMutation = useApiMutation(
    (variables) => apiService.updateVehicle(variables.id, variables.data),
    ['vehiculos', usuario?.id]
  );

  const deleteVehicleMutation = useApiMutation(
    (id) => apiService.deleteVehicle(id),
    ['vehiculos', usuario?.id]
  );


  const vehiculosFiltrados = vehiculos.filter(vehiculo =>
    (vehiculo.license || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (vehiculo.brand || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (vehiculo.model || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  const abrirModalAgregar = () => {
    setVehiculoModal(null);
    setMostrarModal(true);
  };

  const abrirModalEditar = (vehiculo) => {
    setVehiculoModal(vehiculo);
    setMostrarModal(true);
  };

  const manejarGuardado = async (datos) => {
    try {
      if (vehiculoModal) {
        await updateVehicleMutation.mutateAsync({ id: vehiculoModal.id, data: datos });
      } else {
        const vehicleDataToSend = {
          ...datos,
          license: datos.license.toUpperCase(),
          userId: usuario.id
        };
        await createVehicleMutation.mutateAsync(vehicleDataToSend);
      }
      
      setMostrarExito(true);
      setTimeout(() => setMostrarExito(false), 3000);
      setMostrarModal(false);

    } catch (error) {
      console.error('Error al guardar vehículo:', error);
    }
  };

  const manejarEliminarVehiculo = (vehiculo) => {
    setVehiculoAEliminar(vehiculo);
    setMostrarConfirmacion(true);
  };

  const confirmarEliminacion = async () => {
    if (vehiculoAEliminar) {
      try {
        await deleteVehicleMutation.mutateAsync(vehiculoAEliminar.id);
        setMostrarConfirmacion(false);
        setVehiculoAEliminar(null);
      } catch (error) {
        console.error('Error al eliminar vehículo:', error);
      }
    }
  };

  const obtenerColorEstado = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'active': return 'success';
      case 'inactive': return 'danger';
      default: return 'secondary';
    }
  };

  const obtenerTextoEstado = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'active': return 'Activo';
      case 'inactive': return 'Inactivo';
      default: return estado || 'Desconocido';
    }
  };

  return (
    <div className="misvehiculos-container">
      <div className="misvehiculos-header">
        <h1>Mis Vehículos</h1>
        <p>Gestiona tus vehículos registrados</p>
      </div>

      <div className="text-center">
        <CustomButton 
          onClick={abrirModalAgregar}
          className="misvehiculos-boton-agregar"
        >
          <i className="bi bi-plus-circle me-2"></i>
          Agregar Vehículo
        </CustomButton>
      </div>

      {mostrarExito && (
        <Alert variant="success" className="misvehiculos-alerta-exito">
          <i className="bi bi-check-circle-fill me-2"></i>
          {vehiculoModal ? 'Vehículo actualizado exitosamente' : 'Vehículo agregado exitosamente'}
        </Alert>
      )}

      <div className="misvehiculos-lista-vehiculos">
        {isLoading ? (
          <LoadingSpinner />
        ) : isError ? (
          <Alert variant="danger">Error al cargar vehículos: {error.message}</Alert>
        ) : vehiculosFiltrados.length > 0 ? (
        <div className="misvehiculos-grupo-fecha">
          <div className="text-center">
            <input
              type="text"
              className="misvehiculos-busqueda"
              placeholder="Buscar por patente..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="misvehiculos-reservas-del-dia">
              {vehiculosFiltrados.map(vehiculo => (
                <div key={vehiculo.id} className="misvehiculos-reserva-card">
                  <div className="misvehiculos-reserva-header">
                    <div className="misvehiculos-reserva-identificacion">
                      <div className="misvehiculos-reserva-patente">
                        {vehiculo.license}
                      </div>
                      <div className="misvehiculos-reserva-divisor"></div>
                      <div className="misvehiculos-reserva-marca">
                        {vehiculo.brand}
                      </div>
                    </div>
                    <div className="misvehiculos-reserva-estado">
                      <span className={`badge bg-${obtenerColorEstado(vehiculo.status)}`}>
                        {obtenerTextoEstado(vehiculo.status)}
                      </span>
                    </div>
                  </div>

                  <div className="misvehiculos-reserva-info">
                    <div className="misvehiculos-cliente-info">
                      <h4>{vehiculo.model}</h4>
                      <p><strong>Año:</strong> {vehiculo.year}</p>
                      {vehiculo.color && <p><strong>Color:</strong> {vehiculo.color}</p>}
                      <p><strong>Propietario:</strong> {usuario.nombre} {usuario.apellido}</p>
                    </div>
                  </div>

                  <div className="misvehiculos-reserva-acciones">
                  <div className="misvehiculos-botones-accion">
                    <Button 
                      onClick={() => abrirModalEditar(vehiculo)}
                      size="sm"
                      className="misvehiculos-boton-accion misvehiculos-boton-editar"
                    >
                      <i className="bi bi-pencil me-1"></i>
                      Editar
                    </Button>

                      <Button 
                        variant="info" 
                        size="sm" 
                        onClick={() => setModalHistorial({
                          show: true,
                          patente: vehiculo.license,
                          vehiculoInfo: {
                            patente: vehiculo.license,
                            marca: vehiculo.brand,
                            modelo: vehiculo.model,
                            año: vehiculo.year,
                            color: vehiculo.color
                          }
                        })}
                        className="misvehiculos-boton-accion misvehiculos-boton-historial"
                      >
                        <i className="bi bi-clock-history me-1"></i>
                        Ver historial
                      </Button>

                    <Button 
                      onClick={() => manejarEliminarVehiculo(vehiculo)}
                      variant="danger"
                      size="sm"
                      className="misvehiculos-boton-accion misvehiculos-boton-eliminar"
                    >
                      <i className="bi bi-trash me-1"></i>
                    </Button>
                  </div>
                </div>
              </div>  
            ))}
          </div>
        </div>
      ) : (
        <div className="misvehiculos-sin-vehiculos">
          <p>No tienes vehículos registrados. ¡Agrega tu primer vehículo!</p>
        </div>
      )}
    </div>

      <EditVehicleModal
        show={mostrarModal}
        vehiculo={vehiculoModal}
        onHide={() => setMostrarModal(false)}
        onSave={manejarGuardado}
      />

      <Modal 
        show={mostrarConfirmacion} 
        onHide={() => setMostrarConfirmacion(false)}
        centered
      >
        <Modal.Header 
          closeButton
          className="misvehiculos-modal-confirm-header"
        >
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        
        <Modal.Body className="misvehiculos-modal-confirm-body">
          <p>¿Estás seguro de que quieres eliminar el vehículo <strong>{vehiculoAEliminar?.license}</strong>?</p>
          <p>Esta acción no se puede deshacer.</p>
        </Modal.Body>
        
        <Modal.Footer className="misvehiculos-modal-confirm-footer">
          <Button 
            variant="secondary" 
            onClick={() => setMostrarConfirmacion(false)}
            className="misvehiculos-boton-confirm-cancelar"
          >
            Cancelar
          </Button>
          <Button 
            variant="danger" 
            onClick={confirmarEliminacion}
          >
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>

      <VerHistorialModal
        show={modalHistorial.show}
        onHide={() => setModalHistorial({ show: false, patente: null, vehiculoInfo: null })}
        patente={modalHistorial.patente}
        vehiculoInfo={modalHistorial.vehiculoInfo}
      />
    </div>
  );
}