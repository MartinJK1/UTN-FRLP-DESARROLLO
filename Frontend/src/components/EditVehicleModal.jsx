import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { vehicleFormSchema, vehicleEditSchema } from '../validations';
import '../assets/styles/modalEdicion.css';
import CustomButton from './CustomButton';

export default function EditVehicleModal({ show, vehiculo, onHide, onSave }) {
  const esEdicion = !!vehiculo;

  // Formatea la patente con guión si tiene 6 caracteres
  const formatearPatente = (patente) => {
    if (!patente || patente.trim() === '') {
      return '';
    }
    
    let patenteLimpia = patente.replace(/\s/g, '').toUpperCase();
    
    if (patenteLimpia.length === 6 && !patenteLimpia.includes('-')) {
      return patenteLimpia.slice(0, 3) + '-' + patenteLimpia.slice(3);
    }
    
    if (patenteLimpia.includes('-')) {
      return patenteLimpia;
    }

    return patenteLimpia;
  };

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: yupResolver(esEdicion ? vehicleEditSchema : vehicleFormSchema),
    mode: 'onChange',
    defaultValues: {
      license: '',
      brand: '',
      model: '',
      year: '',
      color: ''
    }
  });

  useEffect(() => {
    if (vehiculo) {
      reset({
        license: vehiculo.license || vehiculo.patente || '',
        brand: vehiculo.brand || vehiculo.marca || '',
        model: vehiculo.model || vehiculo.modelo || '',
        year: vehiculo.year || vehiculo.año || '',
        color: vehiculo.color || ''
      });
    } else {
      reset({
        license: '',
        brand: 'RENAULT',
        model: '',
        year: '',
        color: ''
      });
    }
  }, [vehiculo, reset]);

  const onSubmitForm = async (data) => {
    await onSave(data);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered className="modal-edicion .modal-content">
      <Modal.Header closeButton className="modal-edicion-header">
        <Modal.Title className="modal-edicion-title">
          <i className="bi bi-car-front me-2"></i>
          {esEdicion ? 'Modificar Vehículo' : 'Agregar Vehículo'}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit(onSubmitForm)}>
        <Modal.Body className="modal-edicion-body">
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="modal-edicion-label"><strong>Patente *</strong></Form.Label>
                <Form.Control
                  {...register('license', {
                    onChange: (e) => {
                      const valorFormateado = formatearPatente(e.target.value);
                      e.target.value = valorFormateado;
                    }
                  })}
                  maxLength={8}
                  className="misvehiculos-modal-control"
                  placeholder="ABC-123"
                  isInvalid={!!errors.license}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.license?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="modal-edicion-label"><strong>Marca *</strong></Form.Label>
                <Form.Control
                  {...register('brand')}
                  className="misvehiculos-modal-control"
                  placeholder="RENAULT"
                  readOnly={!esEdicion}
                  isInvalid={!!errors.brand}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.brand?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="modal-edicion-label"><strong>Modelo *</strong></Form.Label>
                <Form.Control
                  {...register('model')}
                  className="misvehiculos-modal-control"
                  placeholder="Clio"
                  isInvalid={!!errors.model}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.model?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="modal-edicion-label"><strong>Año *</strong></Form.Label>
                <Form.Control
                  type="number"
                  {...register('year', { valueAsNumber: true })}
                  min={1900}
                  max={new Date().getFullYear() + 1}
                  className="misvehiculos-modal-control"
                  placeholder="2024"
                  isInvalid={!!errors.year}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.year?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="modal-edicion-label"><strong>Color</strong></Form.Label>
                <Form.Control
                  {...register('color')}
                  className="misvehiculos-modal-control"
                  placeholder="Blanco"
                  isInvalid={!!errors.color}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.color?.message}
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
                {esEdicion ? 'Guardando...' : 'Agregando...'}
              </>
            ) : (
              <>
                <i className="bi bi-check-circle me-2"></i>
                {esEdicion ? 'Guardar Cambios' : 'Agregar Vehículo'}
              </>
            )}
          </CustomButton>
        </div>
      </Form>
    </Modal>
  );
}