import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiService from '../services/apiService';
import { dividirNombreCompleto } from '../utils/dateUtils';
import { useQuery } from '@tanstack/react-query';

// Crear contexto
const AuthContext = createContext();

// Hook personalizado para usar el contexto
export const usarAuth = () => {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error('usarAuth debe ser usado dentro de un AuthProvider');
  }
  return contexto;
};

// Proveedor del contexto
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Usar React Query para obtener el perfil del usuario si hay un token.
  // La 'queryKey' es ['usuario', token]. Si el token cambia, la query se re-ejecutará.
  const { data: usuario, isLoading, isError, refetch } = useQuery({
    queryKey: ['usuario', token],
    queryFn: async () => {
      if (!token) return null;
      try {
        const response = await apiService.getUserProfile();
        const usuarioTransformado = {
          ...response.data,
          nombre: dividirNombreCompleto(response.data.name).nombre,
          apellido: dividirNombreCompleto(response.data.name).apellido,
          rol: response.data.role
        };
        localStorage.setItem('usuario', JSON.stringify(usuarioTransformado));
        return usuarioTransformado;
    } catch (error) {
        // Si la obtención del perfil falla (ej. token inválido), limpiamos todo.
        console.error('Error al obtener perfil, cerrando sesión:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        setToken(null);
        return null;
      }
    },
    enabled: !!token, // Solo ejecutar la query si hay un token
    staleTime: 1000 * 60 * 15, // Considerar el usuario como "fresh" por 15 minutos
    retry: 1, // Intentar de nuevo solo 1 vez si falla
  });

 
  const iniciarSesion = useCallback(async (credenciales) => {
    try {
      const credencialesParaBackend = {
        email: credenciales.email,
        password: credenciales.contraseña
      };
      const response = await apiService.login(credencialesParaBackend);
      localStorage.setItem('token', response.data.token);
      setToken(response.data.token);
      return { exito: true };
    } catch (error) {
      console.error('❌ Error al iniciar sesión:', error);
      return { exito: false, error: error.message };
    }
  }, []);

  
  const registrarUsuario = useCallback(async (datosUsuario) => {
    try {
      const datosParaBackend = {
        name: `${datosUsuario.nombre} ${datosUsuario.apellido}`.trim(),
        email: datosUsuario.email,
        password: datosUsuario.password,
        phone: datosUsuario.telefono
      };
      const response = await apiService.register(datosParaBackend);
      return { exito: true, usuario: response.data.user };
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      return { exito: false, error: error.message };
    }
  }, []);


  const cerrarSesion = useCallback(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
    setToken(null);
  }, []);

  const estaAutenticado = !!usuario && !!token && !isError;

  // Valor del contexto
  const valor = {
    usuario,
    cargando: isLoading,
    error: isError,
    iniciarSesion,
    registrarUsuario,
    cerrarSesion,
    estaAutenticado,
    refetchUsuario: refetch, 
  };

  return (
    <AuthContext.Provider value={valor}>
      {children}
    </AuthContext.Provider>
  );
};

