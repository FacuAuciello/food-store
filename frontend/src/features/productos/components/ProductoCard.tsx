//#tarjeta de producto del catalogo con boton para agregar al carrito
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { formatearPrecio } from '../../../shared/utils/formato'
import { useCartStore } from '../../../store/cartStore'
import type { Producto } from '../types/producto'

export function ProductoCard({ producto }: { producto: Producto }) {
  const agregar = useCartStore((estado) => estado.agregar)
  const sinStock = !producto.disponible || producto.stock <= 0

  return (
    <Card className="flex flex-col gap-2 p-0">
      {producto.imagen_url !== null ? (
        <img
          src={producto.imagen_url}
          alt={producto.nombre}
          className="h-40 w-full rounded-t-lg object-cover"
        />
      ) : (
        <div className="flex h-40 w-full items-center justify-center rounded-t-lg bg-slate-100 text-sm text-slate-400">
          Sin imagen
        </div>
      )}
      <div className="flex flex-1 flex-col gap-1 px-4 pb-4">
        {producto.categoria !== null && (
          <span className="text-xs font-medium uppercase text-orange-600">
            {producto.categoria.nombre}
          </span>
        )}
        <h3 className="font-semibold">{producto.nombre}</h3>
        <p className="flex-1 text-sm text-slate-500">{producto.descripcion}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg font-bold">{formatearPrecio(producto.precio_base)}</span>
          <span className={`text-xs ${sinStock ? 'text-red-600' : 'text-slate-500'}`}>
            {sinStock ? 'Sin stock' : `Stock: ${producto.stock}`}
          </span>
        </div>
        <Button
          disabled={sinStock}
          onClick={() =>
            agregar({
              producto_id: producto.id,
              nombre: producto.nombre,
              precio_unitario: producto.precio_base,
            })
          }
        >
          Agregar al carrito
        </Button>
      </div>
    </Card>
  )
}
