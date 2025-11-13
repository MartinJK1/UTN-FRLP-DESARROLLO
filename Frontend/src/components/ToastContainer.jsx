import { useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import '../assets/styles/toasts.css';

const ToastNotification = ({ toast, onClose }) => {
  useEffect(() => {
    const toastElement = document.getElementById(`toast-${toast.id}`);
    if (toastElement && window.bootstrap) {
      const bsToast = new window.bootstrap.Toast(toastElement, {
        autohide: toast.delay !== 0,
        delay: toast.delay || 5000
      });
      
      bsToast.show();
      
      toastElement.addEventListener('hidden.bs.toast', () => {
        onClose(toast.id);
      });
      
      return () => {
        toastElement.removeEventListener('hidden.bs.toast', () => {
          onClose(toast.id);
        });
      };
    }
  }, [toast.id, toast.delay, onClose]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return 'bi-check-circle-fill';
      case 'danger':
        return 'bi-exclamation-triangle-fill';
      case 'warning':
        return 'bi-exclamation-triangle-fill';
      case 'info':
        return 'bi-info-circle-fill';
      default:
        return 'bi-info-circle-fill';
    }
  };

  const getBgClass = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-success';
      case 'danger':
        return 'bg-danger';
      case 'warning':
        return 'bg-warning';
      case 'info':
        return 'bg-info';
      default:
        return 'bg-primary';
    }
  };

  return (
    <div
      id={`toast-${toast.id}`}
      className={`toast toast-notification ${getBgClass()}`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className={`toast-header ${getBgClass()} text-white`}>
        <i className={`bi ${getIcon()} me-2`}></i>
        <strong className="me-auto">{toast.title}</strong>
        <button
          type="button"
          className="btn-close btn-close-white"
          data-bs-dismiss="toast"
          aria-label="Cerrar"
        ></button>
      </div>
      <div className="toast-body text-white">
        {toast.message}
      </div>
    </div>
  );
};

const ToastContainerComponent = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div 
      className="toast-container"
      style={{ 
        position: 'fixed',
        bottom: '0',
        right: '0',
        zIndex: 1055,
        pointerEvents: 'none',
        padding: '1rem'
      }}
    >
      {toasts.map((toast) => (
        <ToastNotification
          key={toast.id}
          toast={toast}
          onClose={removeToast}
        />
      ))}
    </div>
  );
};

export default ToastContainerComponent;
