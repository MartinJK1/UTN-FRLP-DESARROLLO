import { useState } from 'react';
import { usarAuth } from '../context/AuthContext';
import { Badge, Card, Form, Row, Col, Button, Alert } from 'react-bootstrap';
import { useApiQuery, useApiMutation } from '../hooks/useApi';
import apiService from '../services/apiService';
import EditReservaModal from '../components/EditReservaModal';
import ReservaDetailsModal from '../components/ReservaDetailsModal';
import '../assets/styles/gestionreservas.css';
import GestionTable from '../components/GestionTable';

export default function GestionReservas() {
  // Estados para filtros
  const [filtroFecha, setFiltroFecha] = useState('');
  const [filtroPeriodo, setFiltroPeriodo] = useState('');
  const [filtroBusqueda, setFiltroBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');

  const { usuario } = usarAuth();
  const esAdmin = usuario?.rol === 'ADMIN';

  // Estados para modales
  const [reservaDetalle, setReservaDetalle] = useState(null);
  const [mostrarModalDetalle, setMostrarModalDetalle] = useState(false);
  const [reservaEditar, setReservaEditar] = useState(null);
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);

  const { data: allReservations = [], isLoading, isError, error } = useApiQuery(
    ['reservas', 'admin'],
    () => apiService.getReservations(null, true),
    {
      enabled: esAdmin,
      select: (data) => data?.data?.reservations || []
    }
  );

  const modificarReservaMutation = useApiMutation(
    (variables) => apiService.updateReservation(variables.id, variables.data),
    ['reservas', 'admin']
  );

  const eliminarReservaMutation = useApiMutation(
    (id) => apiService.deleteReservation(id),
    ['reservas', 'admin']
  );

  const handleEliminar = async (id) => {
    if (window.confirm('¿Seguro que deseas eliminar esta reserva?')) {
      try {
        await eliminarReservaMutation.mutateAsync(id);
      } catch(err) {
        alert('Error al eliminar la reserva');
      }
    }
  };

  // Modal de detalles
  const abrirModalDetalle = (reserva) => {
    setReservaDetalle(reserva);
    setMostrarModalDetalle(true);
  };

  // Modal de edición
  const abrirModalEditar = (reserva) => {
    setReservaEditar(reserva);
    setMostrarModalEditar(true);
  };

  const manejarGuardadoEdicion = async (datos) => {
    try {
      const datosParaBackend = {
          date: datos.fecha,
          time: datos.hora,
          notes: datos.observaciones
      };
      await modificarReservaMutation.mutateAsync({ id: reservaEditar.id, data: datosParaBackend });
      setMostrarModalEditar(false);
      setReservaEditar(null);
    } catch (error) {
      alert('Error al modificar la reserva');
    }
  };

  const reservasFiltradas = allReservations.filter(r => {
    const nombreCompleto = r.user?.name || '';
    const fecha = r.date;
    const hora = r.time;
    const estado = r.status;
    const patente = r.vehicle?.license || '';

    const coincideFecha = !filtroFecha || fecha === filtroFecha;
    const coincidePeriodo = !filtroPeriodo || (filtroPeriodo === 'manana' ? (hora < '13:00') : (hora >= '13:00'));
    const coincideEstado = filtroEstado === 'todos' || estado === filtroEstado;
    
    const coincideBusqueda = !filtroBusqueda || (
      (patente.toLowerCase().includes(filtroBusqueda.toLowerCase())) ||
      (r.user?.dni && r.user.dni.includes(filtroBusqueda)) ||
      (nombreCompleto.toLowerCase().includes(filtroBusqueda.toLowerCase()))
    );
    
    return coincideFecha && coincidePeriodo && coincideEstado && coincideBusqueda;
  });

  if (isLoading) {
      return <div>Cargando reservas...</div>;
  }
  if (isError) {
      return <Alert variant="danger">Error al cargar las reservas: {error.message}</Alert>;
  }

  return (
    <div className="gestionreservas-container">
      <div className="gestionreservas-header">
        <h1>Gestión de Reservas</h1>
        <h3>Consulta y administra los turnos con filtros avanzados</h3>
      </div>
      <Card className="gestionreservas-card-busqueda">
        <Card.Body>
          <Form>
            <Row>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label className="gestionreservas-form-label">
                    <i className="bi bi-search me-2"></i>
                    Buscar atributos
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={filtroBusqueda}
                    onChange={e => setFiltroBusqueda(e.target.value)}
                    placeholder="Ej: ABC123, 12345678, Juan Pérez"
                    className="gestionreservas-form-control"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label className="gestionreservas-form-label">
                    <i className="bi bi-calendar me-2"></i>
                    Fecha
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={filtroFecha}
                    onChange={e => setFiltroFecha(e.target.value)}
                    className="gestionreservas-form-control"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label className="gestionreservas-form-label">
                    <i className="bi bi-clock me-2"></i>
                    Período
                  </Form.Label>
                  <Form.Select
                    value={filtroPeriodo}
                    onChange={e => setFiltroPeriodo(e.target.value)}
                    className="gestionreservas-form-control"
                  >
                    <option value="">Todos</option>
                    <option value="manana">Mañana</option>
                    <option value="tarde">Tarde</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label className="gestionreservas-form-label">
                    <i className="bi bi-check-circle me-2"></i>
                    Estado
                  </Form.Label>
                  <Form.Select
                    value={filtroEstado}
                    onChange={e => setFiltroEstado(e.target.value)}
                    className="gestionreservas-form-control"
                  >
                    <option value="todos">Todos</option>
                    <option value="PENDING">Pendiente</option>
                    <option value="CONFIRMED">Confirmada</option>
                    <option value="COMPLETED">Completada</option>
                    <option value="CANCELLED">Cancelada</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
      <div className="gestionreservas-busqueda-reservas">
        <div className="gestionreservas-resultados-header">
          <h3 className="gestionreservas-resultados-titulo">
            <i className="bi bi-calendar-check me-2"></i>
            Resultados ({reservasFiltradas.length} reservas)
          </h3>
          {(filtroBusqueda || filtroFecha || filtroPeriodo || filtroEstado !== 'todos') && (
            <Badge bg="info" className="gestionreservas-badge-filtros">
              Filtros activos
            </Badge>
          )}
        </div>

        <GestionTable
          columns={[
            { key: 'nombreCompleto', label: 'Nombre', sortable: true, getSortValue: (r) => (r.user?.name || '').toLowerCase(), render: (r) => r.user?.name || '-' },
            { key: 'fecha', label: 'Fecha', sortable: true, width: '130px', render: (r) => r.date },
            { key: 'hora', label: 'Hora', sortable: true, width: '110px', render: (r) => r.time },
            { key: 'servicio', label: 'Servicio', sortable: true, render: (r) => r.service?.name || '-' },
            { key: 'vehiculo', label: 'Vehículo', sortable: true, getSortValue: (r) => (r.vehicle?.license || '').toLowerCase(), render: (r) => `${r.vehicle?.license || ''} - ${r.vehicle?.model || ''}` },
            { key: 'status', label: 'Estado', sortable: true, render: (r) => (
              <Badge bg={
                r.status === 'CONFIRMED' ? 'success' :
                r.status === 'PENDING' ? 'warning' :
                r.status === 'CANCELLED' ? 'danger' :
                r.status === 'COMPLETED' ? 'secondary' : 'secondary'
              } className="fs-6">
                {{
                  CONFIRMED: 'Confirmado',
                  PENDING: 'Pendiente',
                  CANCELLED: 'Cancelado',
                  COMPLETED: 'Completado'
                }[r.status] || r.status}
              </Badge>
            )}
          ]}
          data={reservasFiltradas}
          emptyMessage={'No se encontraron reservas con los filtros seleccionados.'}
          renderActions={(r) => (
            <div className="gestionreservas-reserva-acciones">
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={() => abrirModalDetalle(r)}
                title="Ver Detalle"
                className="gestionreservas-boton-accion gestionreservas-boton-ver"
              >
                <i className="bi bi-eye"></i>
              </Button>
              <Button
                variant="outline-warning"
                size="sm"
                onClick={() => abrirModalEditar(r)}
                title="Modificar reserva"
                className="gestionreservas-boton-accion gestionreservas-boton-editar"
              >
                <i className="bi bi-pencil"></i>
              </Button>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => handleEliminar(r.id)}
                title="Eliminar reserva"
                className="gestionreservas-boton-accion gestionreservas-boton-eliminar"
              >
                <i className="bi bi-trash"></i>
              </Button>
            </div>
          )}
        />
      </div>
      <ReservaDetailsModal
        show={mostrarModalDetalle}
        reserva={reservaDetalle}
        onHide={() => setMostrarModalDetalle(false)}
      />
      <EditReservaModal
        show={mostrarModalEditar}
        reserva={reservaEditar}
        onHide={() => setMostrarModalEditar(false)}
        onSave={manejarGuardadoEdicion}
      />
    </div>
  );
}