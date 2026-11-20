//#pantalla del carrito: items, cantidades, subtotal y total; persiste al recargar
import { Link, useNavigate } from 'react-router-dom'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Button } from '../../../shared/ui/Button'
import { formatearPrecio } from '../../../shared/utils/formato'
import { useCartStore } from '../../../store/cartStore'

export function CarritoPage() {
  const navigate = useNavigate()
  const items = useCartStore((estado) => estado.items)
  const total = useCartStore((estado) => estado.total())
  const quitar = useCartStore((estado) => estado.quitar)
  const cambiarCantidad = useCartStore((estado) => estado.cambiarCantidad)
  const vaciar = useCartStore((estado) => estado.vaciar)

  if (items.length === 0) {
    return (
      <section>
        <h1 className="mb-4 text-2xl font-bold">Carrito</h1>
        <EstadoVacio mensaje="Tu carrito esta vacio">
          <Link to="/" className="font-medium text-orange-600 hover:underline">
            Ir al catalogo
          </Link>
        </EstadoVacio>
      </section>
    )
  }

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold">Carrito</h1>
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase text-slate-600">
            <tr>
              <th className="px-3 py-2">Producto</th>
              <th className="px-3 py-2">Precio</th>
              <th className="px-3 py-2">Cantidad</th>
              <th className="px-3 py-2">Subtotal</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.producto_id} className="border-t border-slate-100">
                <td className="px-3 py-2 font-medium">{item.nombre}</td>
                <td className="px-3 py-2">{formatearPrecio(item.precio_unitario)}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Button
                      tamano="sm"
                      variante="secundario"
                      aria-label={`Restar uno a ${item.nombre}`}
                      disabled={item.cantidad <= 1}
                      onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}
                    >
                      -
                    </Button>
                    <span className="w-6 text-center">{item.cantidad}</span>
                    <Button
                      tamano="sm"
                      variante="secundario"
                      aria-label={`Sumar uno a ${item.nombre}`}
                      onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}
                    >
                      +
                    </Button>
                  </div>
                </td>
                <td className="px-3 py-2">{formatearPrecio(item.precio_unitario * item.cantidad)}</td>
                <td className="px-3 py-2 text-right">
                  <Button tamano="sm" variante="peligro" onClick={() => quitar(item.producto_id)}>
                    Quitar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <Button variante="secundario" onClick={vaciar}>
          Vaciar carrito
        </Button>
        <div className="flex items-center gap-4">
          <span className="text-lg font-bold">Total: {formatearPrecio(total)}</span>
          <Button onClick={() => navigate('/checkout')}>Continuar al checkout</Button>
        </div>
      </div>
    </section>
  )
}
