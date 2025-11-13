import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import Productos from "./pages/Productos";
import Servicios from "./pages/Servicios";
import Reservar from "./pages/Reservar";
import Reservas from "./pages/Reservas";
import Contacto from './pages/Contacto';
import Registro from './pages/Registro';
import Login from './pages/Login';
import RecoverPassword from './pages/RecoverPassword';
import ForgotPassword from './pages/ForgotPassword';
import MisVehiculos from './pages/MisVehiculos';
import MiPerfil from './pages/MiPerfil';
import MisReservas from './pages/MisReservas';
import AdminPanel from './pages/AdminPanel';
import GestionarUsuarios from './pages/GestionarUsuarios';
import HistorialVehiculo from "./pages/HistorialVehiculo";
import CrearServicio from './pages/CrearServicio';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { PrivateRoute } from './components/PrivateRoute';
import ToastContainerComponent from './components/ToastContainer';
import GestionReservas from './pages/GestionReservas';
import GestionVehiculos from './pages/GestionVehiculos';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<HomePage />} />
            <Route path="/productos" element={<Productos />} />
            <Route path="/servicios" element={<Servicios />} />
            <Route path="/contacto" element={<Contacto />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/login" element={<Login />} />
            <Route path="/olvide-mi-contrasena" element={<ForgotPassword />} />
            <Route path="/recuperar-contrasena" element={<RecoverPassword />} />
            <Route path="/reset-password/:token" element={<RecoverPassword />} />
            <Route path="/change-password" element={<RecoverPassword />} />

            {/* Rutas privadas para usuarios autenticados */}
            <Route
              path="/reservar"
              element={
                <PrivateRoute>
                  <Reservar />
                </PrivateRoute>
              }
            />
            <Route
              path="/reservas"
              element={
                <PrivateRoute requiredRole="ADMIN">
                  <Reservas />
                </PrivateRoute>
              }
            />
            <Route
              path="/mis-vehiculos"
              element={
                <PrivateRoute>
                  <MisVehiculos />
                </PrivateRoute>
              }
            />
            <Route
              path="/mi-perfil"
              element={
                <PrivateRoute>
                  <MiPerfil />
                </PrivateRoute>
              }
            />
            <Route
              path="/mis-reservas"
              element={
                <PrivateRoute>
                  <MisReservas />
                </PrivateRoute>
              }
            />

            {/* Rutas privadas para administradores */}
            <Route
              path="/admin"
              element={
                <PrivateRoute requiredRole="ADMIN">
                  <AdminPanel />
                </PrivateRoute>
              }
            />
            <Route
              path="/gestion-usuarios"
              element={
                <PrivateRoute requiredRole="ADMIN">
                  <GestionarUsuarios />
                </PrivateRoute>
              }
            />
            <Route
              path="/gestion-reservas"
              element={
                <PrivateRoute requiredRole="ADMIN">
                  <GestionReservas />
                </PrivateRoute>
              }
            />
            <Route
              path="/gestion-vehiculos"
              element={
                <PrivateRoute requiredRole="ADMIN">
                  <GestionVehiculos />
                </PrivateRoute>
              }
            />
            <Route
              path="/crear-servicio"
              element={
                <PrivateRoute requiredRole="ADMIN">
                  <CrearServicio />
                </PrivateRoute>
              }
            />
            <Route
              path="/historial-vehiculo"
              element={
                <PrivateRoute requiredRole="ADMIN">
                  <HistorialVehiculo />
                </PrivateRoute>
              }
            />
          </Routes>
        </Layout>
        <ToastContainerComponent />
      </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}