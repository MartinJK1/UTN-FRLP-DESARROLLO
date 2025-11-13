import { useState } from 'react';
import { Button, Badge, Alert, Collapse, Modal } from 'react-bootstrap';
import { usarAuth } from '../context/AuthContext';
import { formatearFechaHoraParaMostrar, combinarNombreCompleto, dividirNombreCompleto } from '../utils/dateUtils';
import { useApiQuery, useApiMutation } from '../hooks/useApi';
import apiService from '../services/apiService';
import LoadingSpinner from '../components/LoadingSpinner';
import '../assets/styles/misreservas.css';
import EditReservaModal from "../components/EditReservaModal";

export default function MisReservas() {
  const { usuario } = usarAuth();

  const [reservaEditar, setReservaEditar] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [modalCancelar, setModalCancelar] = useState({ show: false, reserva: null, error: '' });
  const [reservasExpandidas, setReservasExpandidas] = useState(new Set());

  const { data: reservasResponse, isLoading, isError, error } = useApiQuery(
    ['my-reservations'],
    () => apiService.getMyReservations(),
    {
      enabled: !!usuario?.id,
      select: (data) => {
        const loadedReservas = data.data.reservations || [];
        const statusToEstado = (status) => {
          switch ((status || '').toUpperCase()) {
            case 'PENDING': return 'pendiente';
            case 'CONFIRMED': return 'confirmado';
            case 'CANCELLED': return 'cancelado';
            case 'COMPLETED': return 'completado';
            default: return status?.toLowerCase() || '';
          }
        };
        return loadedReservas.map(reserva => {
          const { nombre, apellido} = dividirNombreCompleto(reserva.user?.name);
          return { 
            ...reserva,
            fecha: reserva.date,
            hora: reserva.time,
            estado: statusToEstado(reserva.status),
            servicio: reserva.service?.name,
            patente: reserva.vehicle?.license,
            modelo: reserva.vehicle?.model,
            observaciones: reserva.notes,
            nombre,
            apellido
          };
        });
      }
    }
  );

  const reservasUsuario = reservasResponse || [];

  const cancelarReservaMutation = useApiMutation(
    (id) => apiService.cancelReservation(id),
    ['reservas', usuario?.id]
  );
  
  const modificarReservaMutation = useApiMutation(
    (variables) => apiService.updateReservation(variables.id, variables.data),
    ['reservas', usuario?.id]
  );


  const reservasFiltradas = filtroEstado === 'todos'
    ? reservasUsuario
    : reservasUsuario.filter(reserva => reserva.estado === filtroEstado);

  // Obtiene el color del badge según el estado
  const obtenerColorEstado = (estado) => {
    switch (estado) {
      case 'confirmado': return 'success';
      case 'pendiente': return 'warning';
      case 'cancelado': return 'danger';
      case 'completado': return 'success';
      default: return 'secondary';
    }
  };

  // Obtiene el texto traducido del estado
  const obtenerTextoEstado = (estado) => {
    switch (estado) {
      case 'confirmado': return 'Confirmado';
      case 'pendiente': return 'Pendiente';
      case 'cancelado': return 'Cancelado';
      case 'completado': return 'Completado';
      default: return estado;
    }
  };

  const toggleReserva = (reservaId) => {
    const nuevasExpandidas = new Set(reservasExpandidas);
    if (nuevasExpandidas.has(reservaId)) {
      nuevasExpandidas.delete(reservaId);
    } else {
      nuevasExpandidas.add(reservaId);
    }
    setReservasExpandidas(nuevasExpandidas);
  };

  const intentarCancelarReserva = (reserva) => {
    const fechaHoraTurno = new Date(`${reserva.fecha}T${reserva.hora}`);
    const ahora = new Date();
    const diffHoras = (fechaHoraTurno - ahora) / (1000 * 60 * 60);
    if (diffHoras < 24) {
      setModalCancelar({ show: true, reserva: null, error: 'Solo puedes cancelar reservas con más de 24hs de anticipación.' });
    } else {
      setModalCancelar({ show: true, reserva, error: '' });
    }
  };

  const manejarCancelarReserva = async () => {
    if (!modalCancelar.reserva) return;
    try {
      await cancelarReservaMutation.mutateAsync(modalCancelar.reserva.id);
      setReservasExpandidas(new Set());
      setModalCancelar({ show: false, reserva: null, error: '' });
    } catch (err) {
      console.error("Error al cancelar la reserva:", err);
      setModalCancelar({ show: true, reserva: modalCancelar.reserva, error: 'No se pudo cancelar la reserva.' });
    }
  };

  const estadisticas = {
    total: reservasUsuario.length,
    confirmadas: reservasUsuario.filter(r => r.estado === 'confirmado').length,
    pendientes: reservasUsuario.filter(r => r.estado === 'pendiente').length,
    canceladas: reservasUsuario.filter(r => r.estado === 'cancelado').length,
    completadas: reservasUsuario.filter(r => r.estado === 'completado').length
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return <Alert variant="danger">Error al cargar las reservas: {error.message}</Alert>;
  }

  if (reservasUsuario.length === 0) {
    return <Alert variant="info">No tienes reservas registradas.</Alert>;
  }

  return (
    <div className="misreservas-container">
      <div className="misreservas-header">
        <h1>Mis Reservas</h1>
        <p>Gestiona tus turnos programados</p>
      </div>
      {isLoading ? <LoadingSpinner /> : (
        <>
          <div className="misreservas-estadisticas-rapidas">
            <div className="misreservas-stat-card">
              <h3>Total Reservas</h3>
              <p className="misreservas-stat-numero">{estadisticas.total}</p>
            </div>
            <div className="misreservas-stat-card">
              <h3>Confirmadas</h3>
              <p className="misreservas-stat-numero confirmado">{estadisticas.confirmadas}</p>
            </div>
            <div className="misreservas-stat-card">
              <h3>Pendientes</h3>
              <p className="misreservas-stat-numero pendiente">{estadisticas.pendientes}</p>
            </div>
            <div className="misreservas-stat-card">
              <h3>Canceladas</h3>
              <p className="misreservas-stat-numero cancelado">{estadisticas.canceladas}</p>
            </div>
            <div className="misreservas-stat-card">
              <h3>Completadas</h3>
              <p className="misreservas-stat-numero completado">{estadisticas.completadas}</p>
            </div>
          </div>
          <div className="misreservas-filtros">
            <div className="misreservas-filtro-grupo">
              <label>Filtrar por estado:</label>
              <select 
                value={filtroEstado} 
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="misreservas-form-select"
              >
                <option value="todos">Todos los estados</option>
                <option value="confirmado">Confirmado</option>
                <option value="pendiente">Pendiente</option>
                <option value="cancelado">Cancelado</option>
                <option value="completado">Completado</option>
              </select>
            </div>
          </div>
          <div className="misreservas-lista-reservas">
            {reservasFiltradas.length > 0 ? (
              <div className="misreservas-grupo-fecha">
                <h2 className="misreservas-fecha-titulo" style={{ textAlign: 'center' }}>Mis Reservas</h2>
                <div className="misreservas-reservas-del-dia">
                  {reservasFiltradas
                    .filter(reserva => reserva && reserva.id)
                    .sort((a, b) => {
                      if (a.estado === 'cancelado' && b.estado === 'cancelado') {
                        return new Date(b.fecha) - new Date(a.fecha);
                      }
                      if (a.estado !== 'cancelado' && b.estado !== 'cancelado') {
                        return new Date(a.fecha) - new Date(b.fecha);
                      }
                      return a.estado === 'cancelado' ? 1 : -1;
                    })
                    .map(reserva => (
                      <div key={reserva.id} className="misreservas-reserva-card">
                        <div 
                          className="misreservas-reserva-header" 
                          onClick={() => toggleReserva(reserva.id)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="misreservas-reserva-hora">
                            {formatearFechaHoraParaMostrar(reserva.date, reserva.time)}
                          </div>
                          <div className="misreservas-reserva-header-right">
                            <span className={`badge bg-${obtenerColorEstado(reserva.estado)}`}>
                              {obtenerTextoEstado(reserva.estado)}
                            </span>
                            <i className={`bi ${reservasExpandidas.has(reserva.id) ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                          </div>
                        </div>
                        
                        <Collapse in={reservasExpandidas.has(reserva.id)}>
                          <div className="misreservas-reserva-content">
                            <div className="misreservas-reserva-info">
                              <div className="misreservas-cliente-info">
                                <h4>{reserva.servicio || 'Servicio no especificado'}</h4>
                                <p><strong>Vehículo:</strong> {reserva.patente || 'N/A'} - {reserva.modelo || 'N/A'}</p>
                                <p><strong>Cliente:</strong> {combinarNombreCompleto(reserva.nombre, reserva.apellido) || 'N/A'}</p>
                              </div>
                              {reserva.observaciones && (
                                <div className="misreservas-observaciones">
                                  <p><strong>Tus observaciones:</strong> {reserva.observaciones}</p>
                                </div>
                              )}
                              {reserva.serviceHistory && reserva.serviceHistory.length > 0 && reserva.serviceHistory[0].observaciones && (
                                <div className="misreservas-observaciones-mecanico">
                                  <p><strong>Observaciones del mecánico:</strong> {reserva.serviceHistory[0].observaciones}</p>
                                  <p>
                                    <em>Por: {reserva.serviceHistory[0].mecanico} - {new Date(reserva.serviceHistory[0].fechaServicio).toLocaleDateString('es-ES')}</em>
                                  </p>
                                </div>
                              )}
                            </div>
                            <div className="misreservas-reserva-acciones">
                              {reserva.estado !== 'cancelado' && reserva.estado !== 'completado' && (
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => setReservaEditar(reserva)}
                                  className="misreservas-boton-editar"
                                >
                                  <i className="bi bi-pencil"></i> Modificar
                                </Button>
                              )}
                              {(reserva.estado === 'pendiente' || reserva.estado === 'confirmado') && (
                                <Button 
                                  variant="outline-danger" 
                                  size="sm" 
                                  onClick={() => intentarCancelarReserva(reserva)}
                                  className="misreservas-boton-cancelar"
                                >
                                  <i className="bi bi-x-circle me-1"></i>
                                  Cancelar Reserva
                                </Button>
                              )}
                            </div>
                          </div>
                        </Collapse>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <div className="misreservas-sin-reservas">
                <p>No tienes reservas registradas para el filtro seleccionado.</p>
              </div>
            )}
          </div>
          <div className="misreservas-info-adicional">
            <h6>
              <i className="bi bi-info-circle me-2"></i>
              Información Importante:
            </h6>
            <ul>
              <li>Las reservas se pueden cancelar hasta 24 horas antes del turno</li>
              <li>Recibirás confirmación por email cuando tu turno sea confirmado</li>
              <li>Llega 10 minutos antes de tu hora programada</li>
              <li>Trae la documentación del vehículo si es necesario</li>
            </ul>
          </div>
        </>
      )}
      <EditReservaModal
        show={!!reservaEditar}
        reserva={reservaEditar}
        onHide={() => setReservaEditar(null)}
        onSave={async (nuevosDatos) => {
          try {
            await modificarReservaMutation.mutateAsync({
              id: reservaEditar.id,
              data: {
                date: nuevosDatos.fecha,
                time: nuevosDatos.hora,
                notes: nuevosDatos.observaciones,
              }
            });
            setReservaEditar(null);
            setReservasExpandidas(new Set());
          } catch(err) {
            console.error("Error al modificar la reserva", err);
          }
        }}
      />
      <Modal show={modalCancelar.show} onHide={() => setModalCancelar({ show: false, reserva: null, error: '' })} centered>
        <Modal.Header closeButton>
          <Modal.Title>Cancelar Reserva</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalCancelar.error ? (
            <div className="alert alert-warning misreservas-modal-alert">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {modalCancelar.error}
            </div>
          ) : (
            <>
              <p>¿Estás seguro de que quieres cancelar esta reserva?</p>
              <ul className="misreservas-modal-lista">
                <li><b>Fecha:</b> {modalCancelar.reserva?.fecha}</li>
                <li><b>Hora:</b> {modalCancelar.reserva?.hora}</li>
                <li><b>Servicio:</b> {modalCancelar.reserva?.servicio}</li>
              </ul>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalCancelar({ show: false, reserva: null, error: '' })}>
            Cerrar
          </Button>
          {!modalCancelar.error && (
            <Button variant="danger" onClick={manejarCancelarReserva}>
              Cancelar Reserva
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
}