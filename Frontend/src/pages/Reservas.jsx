import { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { usarAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatearFechaParaMostrar, obtenerFechaActual } from '../utils/dateUtils';
import { useApiQuery, useApiMutation } from '../hooks/useApi';
import { useQueryClient } from '@tanstack/react-query';
import apiService from '../services/apiService';
import RegistrarServicioModal from '../components/RegistrarServicioModal';
import LoadingSpinner from '../components/LoadingSpinner';
import '../assets/styles/reservas.css';

export default function Reservas() {
  const { usuario } = usarAuth();
  const queryClient = useQueryClient();
  const { showSuccess, showError, showWarning } = useToast();

  const [fechaSeleccionada, setFechaSeleccionada] = useState(obtenerFechaActual());
  const [mostrarModalServicio, setMostrarModalServicio] = useState(false);
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);

  const { data: reservasDelDia = [], isLoading: loadingReservasDelDia, isError: isErrorReservas, error: errorReservasDelDia } = useApiQuery(
    ['reservasPorFecha', fechaSeleccionada],
    () => apiService.getReservationsByDate(fechaSeleccionada),
    {
      enabled: !!fechaSeleccionada,
      select: (response) => {
        if (!response.success) return [];
        return response.data.map(reserva => ({
          ...reserva,
          fecha: reserva.date,
          hora: reserva.time,
          estado: reserva.status,
          nombre: reserva.user ? reserva.user.name : 'N/A',
          telefono: reserva.user ? reserva.user.phone : 'N/A',
          patente: reserva.vehicle ? reserva.vehicle.license : 'N/A',
          modelo: reserva.vehicle ? `${reserva.vehicle.brand} ${reserva.vehicle.model}` : 'N/A',
          servicio: reserva.service ? reserva.service.name : 'N/A',
          observaciones: reserva.notes || '',
        }));
      }
    }
  );
  
  const cancelarReservaMutation = useApiMutation(
    apiService.cancelReservation,
    ['reservasPorFecha', fechaSeleccionada]
  );

  const abrirModalServicio = (reserva) => {
    setReservaSeleccionada(reserva);
    setMostrarModalServicio(true);
  };

  const cerrarModalServicio = () => {
    setMostrarModalServicio(false);
    setReservaSeleccionada(null);
  };

  const manejarServicioRegistrado = () => {
    // Al registrar, invalidamos las queries para que se actualice el estado
    queryClient.invalidateQueries(['reservasPorFecha', fechaSeleccionada]);
  };

  const handleCancelarReserva = async (id) => {
    const credencial = window.prompt('Ingrese credencial de ADMIN para cancelar la reserva:');
    if (credencial && credencial.toLowerCase() === 'admin123') {
      try {
        await cancelarReservaMutation.mutateAsync(id, {
          onSuccess: () => {
            showSuccess('Reserva cancelada exitosamente.');
          },
          onError: (error) => {
            showError(`Error al cancelar la reserva: ${error.message}`);
          }
        });
      } catch (error) {
        // El onError de la mutación ya maneja esto, pero lo dejamos por si acaso.
        showError("Ocurrió un error inesperado durante la cancelación.");
        console.error("Error en el proceso de cancelación:", error);
      }
    } else if (credencial !== null) {
      showWarning('Credencial incorrecta. Solo el admin puede cancelar reservas.');
    }
  };
  
  const obtenerColorEstado = (estado) => {
    switch (estado) {
      case 'COMPLETED': return 'success';
      case 'PENDING': return 'warning';
      case 'CANCELLED': return 'danger';
      case 'CONFIRMED': return 'primary';
      default: return 'secondary';
    }
  };

  const reservasAgrupadas = reservasDelDia.reduce((acc, reserva) => {
    const fecha = reserva.fecha;
    if (!acc[fecha]) {
      acc[fecha] = [];
    }
    acc[fecha].push(reserva);
    return acc;
  }, {});

  return (
    <div className="reservas-container">
      <div className="reservas-header">
        <div className="reservas-header-content">
          <div>
            <h1>Turnos del Día</h1>
            <p>Visualiza todas las reservas para la fecha seleccionada</p>
          </div>
          <div className="reservas-filtro-fecha">
            <label htmlFor="fechaSeleccionada">Fecha:</label>
            <input
              type="date"
              id="fechaSeleccionada"
              value={fechaSeleccionada}
              onChange={(e) => setFechaSeleccionada(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="reservas-estadisticas-rapidas">
        <div className="reservas-stat-card">
          <h3>Total Reservas</h3>
          <p className="reservas-stat-numero">{reservasDelDia.length}</p>
        </div>
        <div className="reservas-stat-card">
          <h3>Completadas</h3>
          <p className="reservas-stat-numero completada">{reservasDelDia.filter(r => r.estado === 'COMPLETED').length}</p>
        </div>
        <div className="reservas-stat-card">
          <h3>Pendientes</h3>
          <p className="reservas-stat-numero pendiente">{reservasDelDia.filter(r => r.estado === 'PENDING').length}</p>
        </div>
        <div className="reservas-stat-card">
          <h3>Canceladas</h3>
          <p className="reservas-stat-numero cancelado">{reservasDelDia.filter(r => r.estado === 'CANCELLED').length}</p>
        </div>
      </div>
      <div className="reservas-lista-reservas-admin">
        {loadingReservasDelDia ? (
          <LoadingSpinner />
        ) : isErrorReservas ? (
          <div className="reservas-alert-danger">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            Error al cargar reservas: {errorReservasDelDia.message}
          </div>
        ) : Object.keys(reservasAgrupadas).length > 0 ? (
          Object.entries(reservasAgrupadas).map(([fecha, reservasDelDiaFecha]) => (
            <div key={fecha} className="reservas-grupo-fecha">
              <h2 className="reservas-fecha-titulo">{formatearFechaParaMostrar(fecha)}</h2>

              <div className="reservas-reservas-del-dia">
                {reservasDelDiaFecha
                  .sort((a, b) => a.hora.localeCompare(b.hora))
                  .map(reserva => (
                    <div key={reserva.id} className="reservas-reserva-card">
                      <div className="reservas-reserva-header">
                        <div className="reservas-reserva-hora">
                          <strong>{reserva.hora}</strong>
                        </div>
                        <div className="reservas-reserva-estado">
                          <span className={`badge bg-${obtenerColorEstado(reserva.estado)}`}>
                            {reserva.estado}
                          </span>
                        </div>
                      </div>

                      <div className="reservas-reserva-info">
                        <div className="reservas-reserva-contenido">
                          <div className="reservas-cliente-info">
                            <h4>{reserva.servicio || 'Servicio no especificado'}</h4>
                            <p><strong>Cliente:</strong> {reserva.nombre || 'N/A'}</p>
                          </div>

                          <div className="reservas-vehiculo-info">
                            <p><strong>Vehículo:</strong> {reserva.patente} - {reserva.modelo}</p>
                            <p><strong>Servicio:</strong> {reserva.servicio}</p>
                          </div>

                          {reserva.observaciones && (
                            <div className="reservas-observaciones">
                              <p><strong>Observaciones:</strong> {reserva.observaciones}</p>
                            </div>
                          )}
                        </div>

                        <div className="reservas-reserva-acciones">
                          {reserva.estado === 'PENDING' && (
                            <Button 
                              variant="success"
                              size="sm"
                              onClick={() => abrirModalServicio(reserva)}
                              className="reservas-boton-registrSar"
                            >
                              Registrar Servicio
                            </Button>
                          )}

                          <button 
                            onClick={() => handleCancelarReserva(reserva.id)}
                            className="reservas-boton-cancelar"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))
        ) : (
          <div className="reservas-sin-reservas">
            <div className="reservas-alert-info">
              <i className="bi bi-info-circle me-2"></i>
              No hay reservas registradas para el día {formatearFechaParaMostrar(fechaSeleccionada)}.
            </div>
          </div>
        )}
      </div>
      <RegistrarServicioModal
        show={mostrarModalServicio}
        onHide={cerrarModalServicio}
        reserva={reservaSeleccionada}
        onSuccess={manejarServicioRegistrado}
      />
    </div>
  );
} 