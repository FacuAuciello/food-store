//#abm de productos para el admin con tanstack table y tanstack form, incluye cambio de stock
import type { ColumnDef } from '@tanstack/react-table'
import { useState } from 'react'
import { handleApiError } from '../../../shared/api/handleApiError'
import { DataTable } from '../../../shared/components/DataTable'
import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Skeleton } from '../../../shared/components/Skeleton'
import { Button } from '../../../shared/ui/Button'
import { Modal } from '../../../shared/ui/Modal'
import { formatearPrecio } from '../../../shared/utils/formato'
import { useCategorias } from '../../categorias/hooks/useCategorias'
import { ProductoForm } from '../components/ProductoForm'
import { StockForm } from '../components/StockForm'
import {
  useActualizarProducto,
  useActualizarStock,
  useCrearProducto,
  useEliminarProducto,
  useProductos,
} from '../hooks/useProductos'
import type { Producto, ProductoInput, StockInput } from '../types/producto'

export function AdminProductosPage() {
  //#el panel pide limit=100 y pagina del lado del cliente
  const productos = useProductos({ skip: 0, limit: 100 })
  const categorias = useCategorias()
  const crear = useCrearProducto()
  const actualizar = useActualizarProducto()
  const cambiarStock = useActualizarStock()
  const eliminar = useEliminarProducto()

  const [formAbierto, setFormAbierto] = useState(false)
  const [editando, setEditando] = useState<Producto | undefined>(undefined)
  const [stockDe, setStockDe] = useState<Producto | null>(null)
  const [aEliminar, setAEliminar] = useState<Producto | null>(null)

  const abrirNuevo = () => {
    crear.reset()
    actualizar.reset()
    setEditando(undefined)
    setFormAbierto(true)
  }

  const abrirEdicion = (producto: Producto) => {
    crear.reset()
    actualizar.reset()
    setEditando(producto)
    setFormAbierto(true)
  }

  const cerrarForm = () => setFormAbierto(false)

  const guardar = (datos: ProductoInput) => {
    if (editando === undefined) {
      crear.mutate(datos, { onSuccess: cerrarForm })
    } else {
      actualizar.mutate({ id: editando.id, datos }, { onSuccess: cerrarForm })
    }
  }

  const guardarStock = (datos: StockInput) => {
    if (stockDe !== null) {
      cambiarStock.mutate({ id: stockDe.id, datos }, { onSuccess: () => setStockDe(null) })
    }
  }

  const confirmarEliminar = () => {
    if (aEliminar !== null) {
      eliminar.mutate(aEliminar.id, { onSuccess: () => setAEliminar(null) })
    }
  }

  const columnas: ColumnDef<Producto>[] = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'nombre', header: 'Nombre' },
    {
      id: 'categoria',
      header: 'Categoria',
      cell: ({ row }) => row.original.categoria?.nombre ?? '-',
    },
    {
      accessorKey: 'precio_base',
      header: 'Precio',
      cell: ({ row }) => formatearPrecio(row.original.precio_base),
    },
    { accessorKey: 'stock', header: 'Stock' },
    {
      id: 'disponible',
      header: 'Disponible',
      cell: ({ row }) =>
        row.original.disponible ? (
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
            Si
          </span>
        ) : (
          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700">
            No
          </span>
        ),
    },
    {
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-2">
          <Button tamano="sm" variante="secundario" onClick={() => abrirEdicion(row.original)}>
            Editar
          </Button>
          <Button
            tamano="sm"
            variante="secundario"
            onClick={() => {
              cambiarStock.reset()
              setStockDe(row.original)
            }}
          >
            Stock
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
        <h1 className="text-2xl font-bold">Productos</h1>
        <Button onClick={abrirNuevo} disabled={categorias.data === undefined || categorias.data.length === 0}>
          Nuevo producto
        </Button>
      </div>

      {productos.isLoading && <Skeleton className="h-40 w-full" />}
      {productos.isError && (
        <EstadoError
          mensaje={handleApiError(productos.error)}
          onReintentar={() => void productos.refetch()}
        />
      )}
      {productos.data !== undefined &&
        (productos.data.items.length === 0 ? (
          <EstadoVacio mensaje="Todavia no hay productos" />
        ) : (
          <DataTable datos={productos.data.items} columnas={columnas} tamanoPagina={8} />
        ))}

      <Modal
        abierto={formAbierto}
        titulo={editando === undefined ? 'Nuevo producto' : 'Editar producto'}
        onCerrar={cerrarForm}
      >
        <ProductoForm
          key={editando?.id ?? 'nuevo'}
          inicial={editando}
          categorias={categorias.data ?? []}
          enviando={crear.isPending || actualizar.isPending}
          error={errorForm !== null ? handleApiError(errorForm) : undefined}
          onEnviar={guardar}
          onCancelar={cerrarForm}
        />
      </Modal>

      <Modal abierto={stockDe !== null} titulo="Cambiar stock" onCerrar={() => setStockDe(null)}>
        {stockDe !== null && (
          <StockForm
            key={stockDe.id}
            producto={stockDe}
            enviando={cambiarStock.isPending}
            error={cambiarStock.isError ? handleApiError(cambiarStock.error) : undefined}
            onEnviar={guardarStock}
            onCancelar={() => setStockDe(null)}
          />
        )}
      </Modal>

      <Modal
        abierto={aEliminar !== null}
        titulo="Eliminar producto"
        onCerrar={() => setAEliminar(null)}
      >
        <p className="mb-2 text-sm">
          Se dara de baja el producto <strong>{aEliminar?.nombre}</strong>. Los pedidos ya creados
          conservan su nombre y su precio.
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
