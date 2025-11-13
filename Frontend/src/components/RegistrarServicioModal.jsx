import { useEffect } from 'react';
import { Modal, Form, Button, Alert, Row, Col, Card, Badge } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { serviceHistorySchema } from '../validations';
import { usarAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useApiQuery, useApiMutation } from '../hooks/useApi';
import apiService from '../services/apiService';
import '../assets/styles/registrarservicio.css';

export default function RegistrarServicioModal({
  show,
  onHide,
  reserva,
  onSuccess
}) {
  const { usuario } = usarAuth();
  const { showSuccess, showError } = useToast();
  const esAdmin = usuario?.rol === 'ADMIN';

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue } = useForm({
    resolver: yupResolver(serviceHistorySchema),
    defaultValues: {
      servicio: '',
      resultado: 'Completado',
      observaciones: '',
      repuestos: '',
      kilometraje: '',
      mecanico: usuario?.nombre ? `${usuario.nombre} ${usuario.apellido}` : ''
    }
  });

  const { data: servicios = [], isLoading: loadingServicios } = useApiQuery(
    ['servicios'],
    () => apiService.getServices(),
    {
      select: (data) => data?.data?.services || []
    }
  );

  const createHistoryMutation = useApiMutation(
    (data) => apiService.createServiceHistory(data),
    ['historialUsuario', reserva?.userId]
  );

  const updateReservationMutation = useApiMutation(
    (variables) => apiService.updateReservationStatus(variables.id, variables.status),
    ['reservas', 'admin', reserva?.userId, `reservasPorFecha`]
  );

  useEffect(() => {
    if (reserva && servicios.length > 0) {
      const servicioInicial = servicios.find(s => s.name === reserva.servicio);
      reset({
        servicio: servicioInicial ? String(servicioInicial.id) : '',
        resultado: 'Completado',
        observaciones: '',
        repuestos: '',
        kilometraje: reserva.vehiculo?.kilometraje || '',
        mecanico: usuario?.nombre ? `${usuario.nombre} ${usuario.apellido}` : ''
      });
    } else if (show) {
      reset({
        servicio: '',
        resultado: 'Completado',
        observaciones: '',
        repuestos: '',
        kilometraje: '',
        mecanico: usuario?.nombre ? `${usuario.nombre} ${usuario.apellido}` : ''
      });
    }
  }, [reserva, servicios, reset, show, usuario]);

  const onSubmit = async (data) => {
    try {
      const servicioSeleccionado = servicios.find(s => s.id === parseInt(data.servicio));
      if (!servicioSeleccionado) {
        showError('El servicio seleccionado no es válido.');
        return;
      }

      const datosCompletos = {
        userId: reserva?.userId || usuario?.id,
        vehicleId: reserva?.vehicleId,
        serviceId: servicioSeleccionado.id,
        reservationId: reserva?.id || null,
        resultado: data.resultado,
        observaciones: data.observaciones,
        repuestos: data.repuestos,
        kilometraje: parseInt(data.kilometraje),
        mecanico: data.mecanico,
        registradoPor: usuario?.role || 'MECHANIC'
      };

      await createHistoryMutation.mutateAsync(datosCompletos);

      if (reserva && reserva.id) {
        await updateReservationMutation.mutateAsync({ id: reserva.id, status: 'COMPLETED' });
      }

      showSuccess('¡Servicio registrado exitosamente en el historial!');
      if (onSuccess) onSuccess();
      onHide();

    } catch (error) {
      showError('Error al guardar servicio: ' + (error.message || 'Error desconocido'));
    }
  };

  if (!esAdmin) {
    return (
      <Modal show={show} onHide={onHide} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Acceso Denegado</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger">
            <i className="bi bi-exclamation-triangle me-2"></i>
            Solo los administradores o mecánicos pueden registrar servicios.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton className="registrarservicio-modal-header">
        <Modal.Title>
          <i className="bi bi-tools me-2"></i>
          Registrar Servicio Realizado
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="registrarservicio-modal-body">
        {reserva && (
          <Card className="registrarservicio-card-reserva mb-4">
            <Card.Header className="registrarservicio-card-reserva-header">
              <i className="bi bi-calendar-check me-2"></i>
              Información de la Reserva
            </Card.Header>
            <Card.Body className="registrarservicio-card-reserva-body">
              <Row>
                <Col md={6}>
                  <p><strong>Cliente:</strong> {reserva.nombre}</p>
                  <p><strong>Vehículo:</strong> {reserva.patente} - {reserva.modelo}</p>
                  <p><strong>Fecha:</strong> {reserva.fecha}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Hora:</strong> {reserva.hora}</p>
                  <p><strong>Servicio:</strong> {reserva.servicio}</p>
                  <p><strong>Estado:</strong>
                    <Badge className="registrarservicio-badge-completado">Completado</Badge>
                  </p>
                </Col>
              </Row>
              <Row>
                <Col md={12}>
                  <p><strong>Observaciones del cliente:</strong> {reserva.observaciones || '-'}</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        )}

        <Card className="registrarservicio-card-formulario">
          <Card.Header className="registrarservicio-card-formulario-header">
            <i className="bi bi-tools me-2"></i>
            Datos del Servicio Realizado
          </Card.Header>
          <Card.Body className="registrarservicio-card-formulario-body">
            <Form onSubmit={handleSubmit(onSubmit)}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: 'var(--color-acento)', fontWeight: 'bold' }}>
                      Servicio Realizado *
                    </Form.Label>
                    <Form.Select
                      {...register('servicio')}
                      isInvalid={!!errors.servicio}
                      style={{
                        backgroundColor: 'var(--color-gris)',
                        border: '1px solid var(--color-acento)',
                        color: 'var(--color-texto)'
                      }}
                    >
                      <option value="">Seleccionar servicio</option>
                      {servicios.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.servicio?.message}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: 'var(--color-acento)', fontWeight: 'bold' }}>
                      Resultado *
                    </Form.Label>
                    <Form.Select
                      {...register('resultado')}
                      isInvalid={!!errors.resultado}
                      style={{
                        backgroundColor: 'var(--color-gris)',
                        border: '1px solid var(--color-acento)',
                        color: 'var(--color-texto)'
                      }}
                    >
                      <option value="Completado">Completado</option>
                      <option value="Pendiente">Pendiente</option>
                      <option value="Cancelado">Cancelado</option>
                      <option value="Requiere Repuestos">Requiere Repuestos</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.resultado?.message}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: 'var(--color-acento)', fontWeight: 'bold' }}>
                      Mecánico Responsable *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      {...register('mecanico')}
                      isInvalid={!!errors.mecanico}
                      placeholder="Nombre del mecánico"
                      style={{
                        backgroundColor: 'var(--color-gris)',
                        border: '1px solid var(--color-acento)',
                        color: 'var(--color-texto)'
                      }}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.mecanico?.message}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ color: 'var(--color-acento)', fontWeight: 'bold' }}>
                      Kilometraje *
                    </Form.Label>
                    <Form.Control
                      type="number"
                      {...register('kilometraje')}
                      isInvalid={!!errors.kilometraje}
                      placeholder="Ej: 45000"
                      style={{
                        backgroundColor: 'var(--color-gris)',
                        border: '1px solid var(--color-acento)',
                        color: 'var(--color-texto)'
                      }}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.kilometraje?.message}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
            </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label style={{ color: 'var(--color-acento)', fontWeight: 'bold' }}>
                  Observaciones del Mecánico *
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  {...register('observaciones')}
                  isInvalid={!!errors.observaciones}
                  placeholder="Describe el trabajo realizado, problemas encontrados, recomendaciones para el cliente..."
                  style={{
                    backgroundColor: 'var(--color-gris)',
                    border: '1px solid var(--color-acento)',
                    color: 'var(--color-texto)'
                  }}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.observaciones?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-4">
                <Form.Label style={{ color: 'var(--color-acento)', fontWeight: 'bold' }}>
                  Repuestos Utilizados
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  {...register('repuestos')}
                  placeholder="Lista de repuestos utilizados (opcional)"
                  style={{
                    backgroundColor: 'var(--color-gris)',
                    border: '1px solid var(--color-acento)',
                    color: 'var(--color-texto)'
                  }}
                />
                </Form.Group>
              </Col>
          </Row>
            </Form>
          </Card.Body>
        </Card>
      </Modal.Body>

      <Modal.Footer className="registrarservicio-modal-footer">
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting || loadingServicios}
          style={{
            backgroundColor: 'var(--color-acento)',
            color: 'var(--color-fondo)',
            border: 'none',
            padding: '0.75rem 1.5rem',
            fontWeight: 'bold',
            borderRadius: '5px'
          }}
        >
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Guardando...
            </>
          ) : (
            <>
              <i className="bi bi-save me-2"></i>
              Registrar Servicio
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
