import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { reservationEditSchema } from '../validations';
import { useApiQuery } from '../hooks/useApi';
import apiService from '../services/apiService';
import '../assets/styles/modalEdicion.css';
import CustomButton from './CustomButton';

export default function EditReservaModal({ show, reserva, onHide, onSave }) {
  const selectServicios = useCallback((data) => data?.data?.services || [], []);

  const { data: servicios = [], isLoading: isLoadingServices } = useApiQuery(
    ['servicios'],
    () => apiService.getServices(),
    {
      select: selectServicios
    }
  );

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: yupResolver(reservationEditSchema),
    mode: 'onChange',
    defaultValues: {
      fecha: '',
      hora: '',
      observaciones: '',
      servicio: ''
    }
  });

  // Extrae el nombre del servicio por defecto, string o undefined
  const defaultServiceName = servicios[0]?.name;

  useEffect(() => {
    if (reserva) {
      reset({
        fecha: reserva.fecha || '',
        hora: reserva.hora || '',
        observaciones: reserva.observaciones || '',
        servicio: reserva.servicio || (defaultServiceName || '')
      });
    } else {
      reset({
        fecha: '',
        hora: '',
        observaciones: '',
        servicio: defaultServiceName || ''
      });
    }
  }, [reserva, defaultServiceName, reset]);

  const onSubmitForm = async (data) => {
    await onSave(data);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered className="modal-edicion .modal-content">
      <Modal.Header closeButton className="modal-edicion-header">
        <Modal.Title className="modal-edicion-title">
          <i className="bi bi-calendar-check me-2"></i>
          Modificar Reserva
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit(onSubmitForm)}>
        <Modal.Body className="modal-edicion-body">
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="modal-edicion-label"><strong>Fecha *</strong></Form.Label>
                <Form.Control
                  type="date"
                  {...register('fecha')}
                  className="misvehiculos-modal-control"
                  isInvalid={!!errors.fecha}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.fecha?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="modal-edicion-label"><strong>Hora *</strong></Form.Label>
                <Form.Control
                  type="time"
                  {...register('hora')}
                  className="misvehiculos-modal-control"
                  isInvalid={!!errors.hora}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.hora?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label className="modal-edicion-label"><strong>Servicio *</strong></Form.Label>
                <Form.Select
                  {...register('servicio')}
                  className="misvehiculos-modal-control"
                  isInvalid={!!errors.servicio}
                  disabled={isLoadingServices}
                >
                  <option value="">{isLoadingServices ? 'Cargando...' : 'Seleccione un servicio'}</option>
                  {servicios.map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.servicio?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label className="modal-edicion-label"><strong>Observaciones</strong></Form.Label>
                <Form.Control
                  as="textarea"
                  {...register('observaciones')}
                  className="misvehiculos-modal-control"
                  rows={3}
                  placeholder="Observaciones adicionales..."
                  isInvalid={!!errors.observaciones}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.observaciones?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <div className="modal-edicion-footer">
          <Button className="modal-edicion-boton-cerrar" onClick={onHide}>
            Cancelar
          </Button>
          <CustomButton 
            className="custom-btn--sm"
            type="submit"
            disabled={isSubmitting}
            style={{ fontSize: '0.95rem' }}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm modal-edicion-spinner" role="status"></span>
                Guardando...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle me-2"></i>
                Guardar Cambios
              </>
            )}
          </CustomButton>
        </div>
      </Form>
    </Modal>
  );
}