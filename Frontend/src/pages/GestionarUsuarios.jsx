import { useState } from 'react';
import { Form, Button, Card, Badge, Alert, Row, Col, Modal } from 'react-bootstrap';
import GestionTable from '../components/GestionTable';
import { dividirNombreCompleto } from '../utils/dateUtils';
import { usarAuth } from '../context/AuthContext';
import UserDetailsModal from '../components/UserDetailsModal';
import EditUserModal from '../components/EditUserModal';
import { useApiQuery, useApiMutation } from '../hooks/useApi';
import apiService from '../services/apiService';
import '../assets/styles/buscarusuarios.css';

export default function GestionarUsuarios() {
  const { usuario } = usarAuth();
  const esAdmin = usuario?.rol === 'ADMIN';
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [mostrarDetalles, setMostrarDetalles] = useState(false);
  const [mostrarEditar, setMostrarEditar] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);
  const [mostrarConfirmEliminar, setMostrarConfirmEliminar] = useState(false);
  
  const { data: allUsers = [], isLoading, isError, error } = useApiQuery(
    ['usuarios', 'admin'],
    () => apiService.getAllUsers(),
    {
      enabled: esAdmin,
      select: (data) => data.data || []
    }
  );

  const updateUserMutation = useApiMutation(
    (variables) => apiService.updateUserById(variables.id, variables.data),
    ['usuarios', 'admin']
  );

  const deleteUserMutation = useApiMutation(
    (id) => apiService.deleteUserById(id),
    ['usuarios', 'admin']
  );

  const usuariosFiltrados = terminoBusqueda
    ? allUsers.filter(u => {
        const terminoLower = terminoBusqueda.toLowerCase();
        return (
          (u.name?.toLowerCase().includes(terminoLower)) ||
          (u.email?.toLowerCase().includes(terminoLower)) ||
          (u.phone?.toLowerCase().includes(terminoLower))
        );
      })
    : allUsers;

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES');
  };

  // Funciones para manejar modales
  const abrirDetalles = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setMostrarDetalles(true);
  };

  const abrirEditar = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setMostrarEditar(true);
  };

  const cerrarModales = () => {
    setMostrarDetalles(false);
    setMostrarEditar(false);
    setUsuarioSeleccionado(null);
  };

  const manejarGuardarUsuario = async (datosActualizados) => {
    try {
      await updateUserMutation.mutateAsync({ id: usuarioSeleccionado.id, data: datosActualizados });
      cerrarModales();
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
    }
  };

  const handleEliminarUsuario = (usuario) => {
    setUsuarioAEliminar(usuario);
    setMostrarConfirmEliminar(true);
  };

  const confirmarEliminarUsuario = async () => {
    if (!usuarioAEliminar) return;
    try {
      await deleteUserMutation.mutateAsync(usuarioAEliminar.id);
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
    } finally {
      setMostrarConfirmEliminar(false);
      setUsuarioAEliminar(null);
    }
  };

  if (isLoading) return <div className="buscarusuarios-container"><p>Cargando usuarios...</p></div>;
  if (isError) return <div className="buscarusuarios-container"><Alert variant="danger">Error al cargar usuarios: {error.message}</Alert></div>;

  return (
    <div className="buscarusuarios-container">
      <div className="buscarusuarios-header">
        <h1>Gestionar Usuarios</h1>
        <h3>Busca y gestiona usuarios registrados en el sistema</h3>
      </div>
      <Card className="buscarusuarios-card-busqueda">
        <Card.Body>
          <Form>
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label className="buscarusuarios-form-label">
                    <i className="bi bi-search me-2"></i>
                    Buscar por nombre, apellido, DNI o email
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={terminoBusqueda}
                    onChange={(e) => setTerminoBusqueda(e.target.value)}
                    placeholder="Ej: Juan Perez, 12345678, juan@email.com"
                    className="buscarusuarios-form-control"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
      <div className="buscarusuarios-busqueda-usuarios">
        <div className="buscarusuarios-resultados-header">
          <h3 className="buscarusuarios-resultados-titulo">
            <i className="bi bi-people me-2"></i>
            Resultados ({usuariosFiltrados.length} usuarios)
          </h3>
          {terminoBusqueda && (
            <Badge bg="info" className="buscarusuarios-badge-busqueda">
              Buscando: "{terminoBusqueda}"
            </Badge>
          )}
        </div>

        <GestionTable
          columns={[
            { 
              key: 'userId',
              label: 'ID',
              sortable: true,
              getSortValue: (u) => u.id,
              render: (u) => u.id || '-'
            },
            {
              key: 'name',
              label: 'Nombre',
              sortable: true,
              getSortValue: (u) => {
                const { apellido, nombre } = dividirNombreCompleto(u.name || '');
                return `${apellido.toLowerCase()} ${nombre.toLowerCase()}`.trim();
              },
              render: (u) => u.name || '-'
            },
            { key: 'email', label: 'Email', sortable: true },
            { key: 'phone', label: 'Teléfono', sortable: true, width: '160px' },
            {
              key: 'role',
              label: 'Rol',
              sortable: true,
              render: (u) => (
                <Badge bg={u.role === 'ADMIN' ? 'danger' : 'success'} className="fs-6">
                  {u.role === 'ADMIN' ? 'Administrador' : 'Cliente'}
                </Badge>
              )
            },
            {
              key: 'createdAt',
              label: 'Fecha de registro',
              sortable: true,
              getSortValue: (u) => new Date(u.createdAt).getTime(),
              render: (u) => formatearFecha(u.createdAt)
            }
          ]}
          data={usuariosFiltrados}
          emptyMessage={terminoBusqueda ? `No se encontraron usuarios que coincidan con "${terminoBusqueda}"` : 'No hay usuarios registrados en el sistema'}
          renderActions={(u) => (
            <div className="buscarusuarios-usuario-acciones">
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={() => abrirDetalles(u)}
                title="Ver Detalles"
                className="buscarusuarios-boton-accion buscarusuarios-boton-ver"
              >
                <i className="bi bi-eye"></i>
              </Button>
              <Button 
                variant="outline-warning" 
                size="sm"
                onClick={() => abrirEditar(u)}
                title="Editar Usuario"
                className="buscarusuarios-boton-accion buscarusuarios-boton-editar"
              >
                <i className="bi bi-pencil"></i>
              </Button>
              {u.role === 'USER' && (
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  onClick={() => handleEliminarUsuario(u)}
                  title="Eliminar Usuario"
                  className="buscarusuarios-boton-accion buscarusuarios-boton-eliminar"
                >
                  <i className="bi bi-trash"></i>
                </Button>
              )}
            </div>
          )}
        />
      </div>
      <UserDetailsModal
        show={mostrarDetalles}
        onHide={cerrarModales}
        usuario={usuarioSeleccionado}
        reservas={[]} 
      />
      
      <EditUserModal
        show={mostrarEditar}
        onHide={cerrarModales}
        usuario={usuarioSeleccionado}
        onSave={manejarGuardarUsuario}
      />

      <Modal show={mostrarConfirmEliminar} onHide={() => setMostrarConfirmEliminar(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que quieres eliminar el usuario <b>{usuarioAEliminar?.name}</b>? Esta acción no se puede deshacer.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setMostrarConfirmEliminar(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmarEliminarUsuario}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}


