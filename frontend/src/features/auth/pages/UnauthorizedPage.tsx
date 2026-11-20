//#pantalla que se muestra cuando el usuario no tiene el rol necesario
import { Link } from 'react-router-dom'

export function UnauthorizedPage() {
  return (
    <div className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-8 text-center">
      <h1 className="mb-2 text-xl font-bold">Sin permiso</h1>
      <p className="mb-4 text-slate-600">No tenes permiso para ver esta pantalla.</p>
      <Link to="/" className="font-medium text-orange-600 hover:underline">
        Volver al inicio
      </Link>
    </div>
  )
}
