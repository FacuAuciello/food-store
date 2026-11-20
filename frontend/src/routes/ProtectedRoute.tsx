//#protege rutas: sin sesion lleva a /login y sin el rol permitido lleva a /unauthorized
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import type { RolUsuario } from '../features/usuarios/types/usuario'

interface ProtectedRouteProps {
  roles?: RolUsuario[]
}

export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const usuario = useAuthStore((estado) => estado.usuario)
  const cargando = useAuthStore((estado) => estado.cargando)
  const ubicacion = useLocation()

  //#mientras checksession confirma la sesion se muestra un indicador
  if (cargando) {
    return <p className="p-10 text-center text-slate-500">Verificando sesion...</p>
  }
  if (usuario === null) {
    return <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />
  }
  if (roles !== undefined && !roles.includes(usuario.role)) {
    return <Navigate to="/unauthorized" replace />
  }
  return <Outlet />
}
