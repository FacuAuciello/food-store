//#pantalla de checkout: confirma el pedido con direccion y forma de pago, vacia el carrito y redirige
import { Link, useNavigate } from 'react-router-dom'
import { handleApiError } from '../../../shared/api/handleApiError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Card } from '../../../shared/ui/Card'
import { formatearPrecio } from '../../../shared/utils/formato'
import { useCartStore } from '../../../store/cartStore'
import { CheckoutForm } from '../components/CheckoutForm'
import type { DatosCheckout } from '../components/CheckoutForm'
import { useCrearPedido } from '../hooks/usePedidos'

export function CheckoutPage() {
  const navigate = useNavigate()
  const items = useCartStore((estado) => estado.items)
  const total = useCartStore((estado) => estado.total())
  const vaciar = useCartStore((estado) => estado.vaciar)
  const crearPedido = useCrearPedido()

  if (items.length === 0) {
    return (
      <section>
        <h1 className="mb-4 text-2xl font-bold">Confirmar pedido</h1>
        <EstadoVacio mensaje="No hay productos en el carrito">
          <Link to="/" className="font-medium text-orange-600 hover:underline">
            Ir al catalogo
          </Link>
        </EstadoVacio>
      </section>
    )
  }

  const confirmar = (datos: DatosCheckout) => {
    crearPedido.mutate(
      {
        items: items.map((item) => ({ producto_id: item.producto_id, cantidad: item.cantidad })),
        forma_pago: datos.forma_pago,
        direccion_entrega: datos.direccion_entrega,
        notas: datos.notas,
      },
      {
        onSuccess: () => {
          vaciar()
          navigate('/mis-pedidos')
        },
      },
    )
  }

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold">Confirmar pedido</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-semibold">Datos de entrega y pago</h2>
          <CheckoutForm
            enviando={crearPedido.isPending}
            error={crearPedido.isError ? handleApiError(crearPedido.error) : undefined}
            onEnviar={confirmar}
          />
        </Card>
        <Card>
          <h2 className="mb-3 font-semibold">Resumen</h2>
          <ul className="flex flex-col gap-1 text-sm">
            {items.map((item) => (
              <li key={item.producto_id} className="flex justify-between">
                <span>
                  {item.cantidad} x {item.nombre}
                </span>
                <span>{formatearPrecio(item.precio_unitario * item.cantidad)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 border-t border-slate-200 pt-3 text-right text-lg font-bold">
            Total: {formatearPrecio(total)}
          </p>
        </Card>
      </div>
    </section>
  )
}
