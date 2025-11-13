# Sistema de Toasts - Documentación de Uso

## Descripción
Se ha implementado un sistema de toasts usando Bootstrap 5.3 que reemplaza las alertas tradicionales por notificaciones más elegantes y modernas.

## Características
- ✅ Toasts de éxito (verde)
- ❌ Toasts de error (rojo) 
- ⚠️ Toasts de advertencia (amarillo)
- ℹ️ Toasts de información (azul)
- 🎨 Diseño responsive y animaciones suaves
- ⏰ Auto-ocultado configurable
- 🔄 Reutilizable en toda la aplicación

## Uso Básico

### 1. Importar el hook useToast
```jsx
import { useToast } from '../context/ToastContext';
```

### 2. Usar en tu componente
```jsx
function MiComponente() {
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  const handleSuccess = () => {
    showSuccess('Operación completada exitosamente!', 'Éxito');
  };

  const handleError = () => {
    showError('Algo salió mal. Intenta nuevamente.', 'Error');
  };

  const handleWarning = () => {
    showWarning('Ten cuidado con esta acción.', 'Advertencia');
  };

  const handleInfo = () => {
    showInfo('Información importante para el usuario.', 'Información');
  };

  return (
    <div>
      <button onClick={handleSuccess}>Mostrar Éxito</button>
      <button onClick={handleError}>Mostrar Error</button>
      <button onClick={handleWarning}>Mostrar Advertencia</button>
      <button onClick={handleInfo}>Mostrar Info</button>
    </div>
  );
}
```

## Opciones Avanzadas

### Personalizar el tiempo de auto-ocultado
```jsx
// Toast que se oculta después de 10 segundos
showSuccess('Mensaje', 'Título', { delay: 10000 });

// Toast que no se oculta automáticamente
showError('Error crítico', 'Error', { delay: 0 });
```

### Ejemplo de uso en formularios
```jsx
const onSubmit = async (formData) => {
  try {
    const resultado = await apiService.createSomething(formData);
    
    if (resultado.success) {
      showSuccess(
        `¡${resultado.message}! Los cambios se han guardado correctamente.`,
        'Operación Exitosa'
      );
    } else {
      showError(
        resultado.message || 'No se pudo completar la operación.',
        'Error en la Operación'
      );
    }
  } catch (error) {
    showError(
      'Ocurrió un error inesperado. Verifica tu conexión.',
      'Error de Conexión'
    );
  }
};
```

## Implementación Técnica

### Archivos Creados/Modificados:
1. `Frontend/src/context/ToastContext.jsx` - Contexto para manejar toasts
2. `Frontend/src/components/ToastContainer.jsx` - Componente que renderiza los toasts
3. `Frontend/src/assets/styles/toasts.css` - Estilos personalizados
4. `Frontend/src/App.jsx` - Integración del ToastProvider
5. `Frontend/src/pages/Reservar.jsx` - Ejemplo de uso en reservas
6. `Frontend/index.html` - Bootstrap JS incluido

### Características Técnicas:
- Usa Bootstrap 5.3 Toast API
- Context API de React para estado global
- Auto-inicialización de toasts con Bootstrap JS
- Animaciones CSS personalizadas
- Responsive design
- Accesibilidad mejorada (ARIA labels)

## Migración desde Alertas

### Antes (Alert tradicional):
```jsx
const [mostrarExito, setMostrarExito] = useState(false);

// En el JSX
{mostrarExito && (
  <Alert variant="success">
    ¡Operación exitosa!
  </Alert>
)}

// En la función
setMostrarExito(true);
setTimeout(() => setMostrarExito(false), 5000);
```

### Después (Toast):
```jsx
const { showSuccess } = useToast();

// En la función
showSuccess('¡Operación exitosa!', 'Éxito');
```

## Beneficios
- 🎯 **Menos código**: No necesitas manejar estados de visibilidad
- 🎨 **Mejor UX**: Notificaciones más elegantes y profesionales
- 📱 **Responsive**: Se adapta a diferentes tamaños de pantalla
- ♿ **Accesible**: Cumple con estándares de accesibilidad
- 🔄 **Reutilizable**: Un solo sistema para toda la aplicación
- ⚡ **Performante**: No afecta el rendimiento de la aplicación
