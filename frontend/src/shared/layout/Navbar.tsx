//#barra de navegacion con nombre y rol, cerrar sesion y acceso al panel solo para admin
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'
import { Button } from '../ui/Button'

const claseLink = ({ isActive }: { isActive: boolean }) =>
  `rounded px-2 py-1 text-sm font-medium ${
    isActive ? 'bg-orange-100 text-orange-700' : 'text-slate-700 hover:bg-slate-100'
  }`

export function Navbar() {
  const navigate = useNavigate()
  const usuario = useAuthStore((estado) => estado.usuario)
  const logout = useAuthStore((estado) => estado.logout)
  const cantidadItems = useCartStore((estado) =>
    estado.items.reduce((suma, item) => suma + item.cantidad, 0),
  )

  const cerrarSesion = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3">
        <NavLink to="/" className="mr-4 text-lg font-bold text-orange-600">
          Food Store
        </NavLink>
        <NavLink to="/" end className={claseLink}>
          Catalogo
        </NavLink>
        <NavLink to="/carrito" className={claseLink}>
          Carrito ({cantidadItems})
        </NavLink>
        {usuario !== null && (
          <NavLink to="/mis-pedidos" className={claseLink}>
            Mis pedidos
          </NavLink>
        )}
        {usuario?.role === 'admin' && (
          <>
            <span className="mx-1 h-5 w-px bg-slate-300" />
            <NavLink to="/admin/resumen" className={claseLink}>
              Resumen
            </NavLink>
            <NavLink to="/admin/categorias" className={claseLink}>
              Categorias
            </NavLink>
            <NavLink to="/admin/productos" className={claseLink}>
              Productos
            </NavLink>
            <NavLink to="/admin/pedidos" className={claseLink}>
              Pedidos
            </NavLink>
            <NavLink to="/admin/usuarios" className={claseLink}>
              Usuarios
            </NavLink>
          </>
        )}
        <div className="ml-auto flex items-center gap-3">
          {usuario === null ? (
            <>
              <NavLink to="/login" className={claseLink}>
                Ingresar
              </NavLink>
              <NavLink to="/register" className={claseLink}>
                Registrarse
              </NavLink>
            </>
          ) : (
            <>
              <span className="text-sm text-slate-600">
                {usuario.full_name} ({usuario.role})
              </span>
              <Button variante="secundario" tamano="sm" onClick={() => void cerrarSesion()}>
                Cerrar sesion
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
