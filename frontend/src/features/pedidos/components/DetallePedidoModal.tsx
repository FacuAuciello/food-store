//#ventana con el detalle de un pedido: datos de entrega, lineas y total
import { BadgeEstado } from '../../../shared/ui/BadgeEstado'
import { Modal } from '../../../shared/ui/Modal'
import { formatearFecha, formatearPrecio } from '../../../shared/utils/formato'
import type { Pedido } from '../types/pedido'

interface DetallePedidoModalProps {
  pedido: Pedido | null
  onCerrar: () => void
}

export function DetallePedidoModal({ pedido, onCerrar }: DetallePedidoModalProps) {
  return (
    <Modal abierto={pedido !== null} titulo={`Pedido #${pedido?.id ?? ''}`} onCerrar={onCerrar}>
      {pedido !== null && (
        <div className="flex flex-col gap-3 text-sm">
          <div className="flex items-center justify-between">
            <BadgeEstado estado={pedido.estado} />
            <span className="text-slate-500">{formatearFecha(pedido.created_at)}</span>
          </div>
          <p>
            <strong>Direccion:</strong> {pedido.direccion_entrega}
          </p>
          <p>
            <strong>Forma de pago:</strong>{' '}
            {pedido.forma_pago === 'EFECTIVO' ? 'Efectivo' : 'Transferencia'}
          </p>
          {pedido.notas !== null && (
            <p>
              <strong>Notas:</strong> {pedido.notas}
            </p>
          )}
          <table className="w-full text-left">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-1">Producto</th>
                <th className="py-1">Cant.</th>
                <th className="py-1">Precio</th>
                <th className="py-1 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {pedido.items.map((item) => (
                <tr key={item.producto_id} className="border-t border-slate-100">
                  <td className="py-1">{item.nombre_producto}</td>
                  <td className="py-1">{item.cantidad}</td>
                  <td className="py-1">{formatearPrecio(item.precio_unitario)}</td>
                  <td className="py-1 text-right">{formatearPrecio(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-right text-base font-bold">Total: {formatearPrecio(pedido.total)}</p>
        </div>
      )}
    </Modal>
  )
}
