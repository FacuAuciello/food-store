//#abm de categorias para el admin con tanstack table y tanstack form
import type { ColumnDef } from '@tanstack/react-table'
import { useState } from 'react'
import { handleApiError } from '../../../shared/api/handleApiError'
import { DataTable } from '../../../shared/components/DataTable'
import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Skeleton } from '../../../shared/components/Skeleton'
import { Button } from '../../../shared/ui/Button'
import { Modal } from '../../../shared/ui/Modal'
import { CategoriaForm } from '../components/CategoriaForm'
import {
  useActualizarCategoria,
  useCategorias,
  useCrearCategoria,
  useEliminarCategoria,
} from '../hooks/useCategorias'
import type { Categoria, CategoriaInput } from '../types/categoria'

export function AdminCategoriasPage() {
  const categorias = useCategorias()
  const crear = useCrearCategoria()
  const actualizar = useActualizarCategoria()
  const eliminar = useEliminarCategoria()

  const [formAbierto, setFormAbierto] = useState(false)
  const [editando, setEditando] = useState<Categoria | undefined>(undefined)
  const [aEliminar, setAEliminar] = useState<Categoria | null>(null)

  const abrirNueva = () => {
    crear.reset()
    actualizar.reset()
    setEditando(undefined)
    setFormAbierto(true)
  }

  const abrirEdicion = (categoria: Categoria) => {
    crear.reset()
    actualizar.reset()
    setEditando(categoria)
    setFormAbierto(true)
  }

  const cerrarForm = () => setFormAbierto(false)

  const guardar = (datos: CategoriaInput) => {
    if (editando === undefined) {
      crear.mutate(datos, { onSuccess: cerrarForm })
    } else {
      actualizar.mutate({ id: editando.id, datos }, { onSuccess: cerrarForm })
    }
  }

  const confirmarEliminar = () => {
    if (aEliminar !== null) {
      eliminar.mutate(aEliminar.id, { onSuccess: () => setAEliminar(null) })
    }
  }

  const columnas: ColumnDef<Categoria>[] = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'nombre', header: 'Nombre' },
    {
      accessorKey: 'descripcion',
      header: 'Descripcion',
      cell: ({ row }) => row.original.descripcion ?? '-',
    },
    {
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button tamano="sm" variante="secundario" onClick={() => abrirEdicion(row.original)}>
            Editar
          </Button>
          <Button
            tamano="sm"
            variante="peligro"
            onClick={() => {
              eliminar.reset()
              setAEliminar(row.original)
            }}
          >
            Eliminar
          </Button>
        </div>
      ),
    },
  ]

  const errorForm = crear.error ?? actualizar.error

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categorias</h1>
        <Button onClick={abrirNueva}>Nueva categoria</Button>
      </div>

      {categorias.isLoading && <Skeleton className="h-40 w-full" />}
      {categorias.isError && (
        <EstadoError
          mensaje={handleApiError(categorias.error)}
          onReintentar={() => void categorias.refetch()}
        />
      )}
      {categorias.data !== undefined &&
        (categorias.data.length === 0 ? (
          <EstadoVacio mensaje="Todavia no hay categorias" />
        ) : (
          <DataTable datos={categorias.data} columnas={columnas} tamanoPagina={8} />
        ))}

      <Modal
        abierto={formAbierto}
        titulo={editando === undefined ? 'Nueva categoria' : 'Editar categoria'}
        onCerrar={cerrarForm}
      >
        <CategoriaForm
          key={editando?.id ?? 'nueva'}
          inicial={editando}
          enviando={crear.isPending || actualizar.isPending}
          error={errorForm !== null ? handleApiError(errorForm) : undefined}
          onEnviar={guardar}
          onCancelar={cerrarForm}
        />
      </Modal>

      <Modal
        abierto={aEliminar !== null}
        titulo="Eliminar categoria"
        onCerrar={() => setAEliminar(null)}
      >
        <p className="mb-2 text-sm">
          Se dara de baja la categoria <strong>{aEliminar?.nombre}</strong>. Sus productos no se
          ocultan: para retirarla del catalogo, da de baja tambien sus productos.
        </p>
        {eliminar.isError && (
          <p role="alert" className="mb-2 rounded bg-red-50 p-2 text-sm text-red-700">
            {handleApiError(eliminar.error)}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button variante="secundario" onClick={() => setAEliminar(null)}>
            Cancelar
          </Button>
          <Button variante="peligro" disabled={eliminar.isPending} onClick={confirmarEliminar}>
            Eliminar
          </Button>
        </div>
      </Modal>
    </section>
  )
}
