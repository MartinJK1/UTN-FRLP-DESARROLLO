import { useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { userEditSchema } from '../validations';
import { dividirNombreCompleto, combinarNombreCompleto } from '../utils/dateUtils';
import '../assets/styles/modalEdicion.css';
import CustomButton from './CustomButton';

export default function EditUserModal({ show, onHide, usuario, onSave }) {
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting }, 
    reset 
  } = useForm({
    resolver: yupResolver(userEditSchema),
    defaultValues: {
      nombre: '',
      apellido: '',
      email: '',
      phone: ''
    }
  });

  useEffect(() => {
    if (usuario) {
      const { nombre, apellido } = dividirNombreCompleto(usuario.name);
      reset({
        nombre: nombre || '',
        apellido: apellido || '',
        email: usuario.email || '',
        phone: usuario.phone || ''
      });
    } else {
      reset({
        nombre: '',
        apellido: '',
        email: '',
        phone: ''
      });
    }
  }, [usuario, reset]);
  
  const onSubmitForm = async (data) => {
    try {
      const datosParaGuardar = {
        name: combinarNombreCompleto(data.nombre, data.apellido),
        email: data.email,
        phone: data.phone
      };
      await onSave(datosParaGuardar);
      onHide();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered className="modal-edicion .modal-content">
      <Modal.Header closeButton className="modal-edicion-header">
        <Modal.Title className="modal-edicion-title">
          <i className="bi bi-pencil-square me-2"></i>
          Editar Usuario
        </Modal.Title>
      </Modal.Header>
      
      <Form onSubmit={handleSubmit(onSubmitForm)}>
        <Modal.Body className="modal-edicion-body">
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="modal-edicion-label"><strong>Nombre *</strong></Form.Label>
                  <Form.Control
                    {...register('nombre')}
                    type="text"
                    isInvalid={!!errors.nombre}
                    className="misvehiculos-modal-control"
                    placeholder="Nombre del usuario"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.nombre?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="modal-edicion-label"><strong>Apellido *</strong></Form.Label>
                  <Form.Control
                    {...register('apellido')}
                    type="text"
                    isInvalid={!!errors.apellido}
                    className="misvehiculos-modal-control"
                    placeholder="Apellido del usuario"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.apellido?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="modal-edicion-label"><strong>Email *</strong></Form.Label>
                  <Form.Control
                    {...register('email')}
                    type="email"
                    isInvalid={!!errors.email}
                    className="misvehiculos-modal-control"
                    placeholder="usuario@email.com"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="modal-edicion-label"><strong>Teléfono *</strong></Form.Label>
                  <Form.Control
                    {...register('phone')}
                    type="tel"
                    isInvalid={!!errors.phone}
                    className="misvehiculos-modal-control"
                    placeholder="11 1234-5678"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.phone?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="modal-edicion-label"><strong>Rol</strong></Form.Label>
                  <Form.Control
                    type="text"
                    value={usuario?.role === 'ADMIN' ? 'Administrador' : 'Cliente'}
                    readOnly
                    className="misvehiculos-modal-control"
                  />
                  <Form.Text className="modal-edicion-texto-ayuda">
                    El rol no se puede modificar desde esta interfaz
                  </Form.Text>
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