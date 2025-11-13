import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './index.css'
import App from './App.jsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext.jsx';

//Crea instancia del Cliente de React Query
const queryClient = new QueryClient();



// StrictMode solo en desarrollo para evitar que se dupliquen peticiones
const isDevelopment = import.meta.env.DEV;

createRoot(document.getElementById('root')).render(
  isDevelopment
    ? (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryClientProvider>
    </StrictMode>
  ) : (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
        </AuthProvider>
      </QueryClientProvider>
    )
  )
