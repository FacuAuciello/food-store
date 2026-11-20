//#catalogo publico: paginado en el servidor, con busqueda, filtro por categoria, skeleton y estado vacio
import { useState } from 'react'
import { handleApiError } from '../../../shared/api/handleApiError'
import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Paginacion } from '../../../shared/components/Paginacion'
import { Skeleton } from '../../../shared/components/Skeleton'
import { Button } from '../../../shared/ui/Button'
import { useCategorias } from '../../categorias/hooks/useCategorias'
import { ProductoCard } from '../components/ProductoCard'
import { useProductos } from '../hooks/useProductos'

const LIMITE = 8

export function CatalogoPage() {
  const [pagina, setPagina] = useState(0)
  const [texto, setTexto] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined)

  const categorias = useCategorias()
  const productos = useProductos({
    skip: pagina * LIMITE,
    limit: LIMITE,
    search: busqueda.length > 0 ? busqueda : undefined,
    categoria_id: categoriaId,
  })

  const totalPaginas = Math.ceil((productos.data?.total ?? 0) / LIMITE)

  const buscar = () => {
    setBusqueda(texto.trim())
    setPagina(0)
  }

  const limpiar = () => {
    setTexto('')
    setBusqueda('')
    setCategoriaId(undefined)
    setPagina(0)
  }

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold">Catalogo</h1>

      <form
        className="mb-6 flex flex-wrap items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault()
          buscar()
        }}
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="busqueda" className="text-sm font-medium text-slate-700">
            Buscar por nombre
          </label>
          <input
            id="busqueda"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Ej: pizza"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="filtro-categoria" className="text-sm font-medium text-slate-700">
            Categoria
          </label>
          <select
            id="filtro-categoria"
            value={categoriaId ?? ''}
            onChange={(e) => {
              setCategoriaId(e.target.value === '' ? undefined : Number(e.target.value))
              setPagina(0)
            }}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Todas</option>
            {categorias.data?.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nombre}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit">Buscar</Button>
        <Button variante="secundario" onClick={limpiar}>
          Limpiar
        </Button>
      </form>

      {productos.isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: LIMITE }, (_, indice) => (
            <Skeleton key={indice} className="h-80 w-full" />
          ))}
        </div>
      )}

      {productos.isError && (
        <EstadoError
          mensaje={handleApiError(productos.error)}
          onReintentar={() => void productos.refetch()}
        />
      )}

      {productos.data !== undefined &&
        (productos.data.items.length === 0 ? (
          <EstadoVacio mensaje="No encontramos productos con esos filtros">
            <Button variante="secundario" onClick={limpiar}>
              Ver todos los productos
            </Button>
          </EstadoVacio>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {productos.data.items.map((producto) => (
                <ProductoCard key={producto.id} producto={producto} />
              ))}
            </div>
            <Paginacion pagina={pagina} totalPaginas={totalPaginas} onCambiar={setPagina} />
          </>
        ))}
    </section>
  )
}
