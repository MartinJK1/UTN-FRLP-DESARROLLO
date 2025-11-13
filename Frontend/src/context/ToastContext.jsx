import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe ser usado dentro de un ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      ...toast,
      show: true
    };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto-hide después del delay especifico (5 segundos)
    const delay = toast.delay || 5000;
    if (delay > 0) {
      setTimeout(() => {
        removeToast(id);
      }, delay);
    }
    
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showSuccess = useCallback((message, title = 'Éxito', options = {}) => {
    return addToast({
      type: 'success',
      title,
      message,
      ...options
    });
  }, [addToast]);

  const showError = useCallback((message, title = 'Error', options = {}) => {
    return addToast({
      type: 'danger',
      title,
      message,
      delay: 7000, // Los errores se muestran mas tiempo
      ...options
    });
  }, [addToast]);

  const showWarning = useCallback((message, title = 'Advertencia', options = {}) => {
    return addToast({
      type: 'warning',
      title,
      message,
      ...options
    });
  }, [addToast]);

  const showInfo = useCallback((message, title = 'Información', options = {}) => {
    return addToast({
      type: 'info',
      title,
      message,
      ...options
    });
  }, [addToast]);

  const value = {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};
