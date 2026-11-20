//#pantalla de admin para listar usuarios y activarlos o desactivarlos
import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '../../../shared/components/DataTable'
import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Skeleton } from '../../../shared/components/Skeleton'
import { handleApiError } from '../../../shared/api/handleApiError'
import { Button } from '../../../shared/ui/Button'
import { useAuthStore } from '../../../store/authStore'
import { useActivarUsuario, useDesactivarUsuario, useUsuarios } from '../hooks/useUsuarios'
import type { Usuario } from '../types/usuario'

export function AdminUsuariosPage() {
  const usuarioSesion = useAuthStore((estado) => estado.usuario)
  const usuarios = useUsuarios()
  const activar = useActivarUsuario()
  const desactivar = useDesactivarUsuario()

  const columnas: ColumnDef<Usuario>[] = [
    { accessorKey: 'username', header: 'Usuario' },
    { accessorKey: 'full_name', header: 'Nombre' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'role', header: 'Rol' },
    {
      id: 'estado',
      header: 'Estado',
      cell: ({ row }) =>
        row.original.disabled ? (
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">
            Desactivado
          </span>
        ) : (
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
            Activo
          </span>
        ),
    },
    {
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => {
        const usuario = row.original
        //#el admin no puede desactivarse a si mismo
        if (usuario.id === usuarioSesion?.id) {
          return <span className="text-xs text-slate-400">Tu cuenta</span>
        }
        return usuario.disabled ? (
          <Button tamano="sm" onClick={() => activar.mutate(usuario.id)}>
            Activar
          </Button>
        ) : (
          <Button tamano="sm" variante="peligro" onClick={() => desactivar.mutate(usuario.id)}>
            Desactivar
          </Button>
        )
      },
    },
  ]

  const errorAccion = activar.error ?? desactivar.error

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold">Usuarios</h1>
      {errorAccion !== null && (
        <p role="alert" className="mb-3 rounded bg-red-50 p-2 text-sm text-red-700">
          {handleApiError(errorAccion)}
        </p>
      )}
      {usuarios.isLoading && <Skeleton className="h-40 w-full" />}
      {usuarios.isError && (
        <EstadoError
          mensaje={handleApiError(usuarios.error)}
          onReintentar={() => void usuarios.refetch()}
        />
      )}
      {usuarios.data !== undefined &&
        (usuarios.data.length === 0 ? (
          <EstadoVacio mensaje="No hay usuarios registrados" />
        ) : (
          <DataTable datos={usuarios.data} columnas={columnas} />
        ))}
    </section>
  )
}
