//#gestion de pedidos para el admin: filtro por estado y botones segun la maquina de estados
import { useState } from 'react'
import { handleApiError } from '../../../shared/api/handleApiError'
import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Skeleton } from '../../../shared/components/Skeleton'
import { Button } from '../../../shared/ui/Button'
import { DetallePedidoModal } from '../components/DetallePedidoModal'
import { TablaPedidos } from '../components/TablaPedidos'
import { useCambiarEstadoPedido, usePedidos } from '../hooks/usePedidos'
import { ESTADOS_PEDIDO, ETIQUETAS_ESTADO, TRANSICIONES_ESTADO } from '../types/pedido'
import type { EstadoPedido, Pedido } from '../types/pedido'

export function AdminPedidosPage() {
  const [estado, setEstado] = useState<EstadoPedido | undefined>(undefined)
  const [detalle, setDetalle] = useState<Pedido | null>(null)

  //#el panel pide limit=100 y pagina del lado del cliente
  const pedidos = usePedidos({ skip: 0, limit: 100, estado })
  const cambiarEstado = useCambiarEstadoPedido()

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <div className="flex flex-col gap-1">
          <label htmlFor="filtro-estado" className="text-sm font-medium text-slate-700">
            Filtrar por estado
          </label>
          <select
            id="filtro-estado"
            value={estado ?? ''}
            onChange={(e) => {
              const valor = ESTADOS_PEDIDO.find((s) => s === e.target.value)
              setEstado(valor)
            }}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Todos</option>
            {ESTADOS_PEDIDO.map((s) => (
              <option key={s} value={s}>
                {ETIQUETAS_ESTADO[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {cambiarEstado.isError && (
        <p role="alert" className="mb-3 rounded bg-red-50 p-2 text-sm text-red-700">
          {handleApiError(cambiarEstado.error)}
        </p>
      )}

      {pedidos.isLoading && <Skeleton className="h-40 w-full" />}
      {pedidos.isError && (
        <EstadoError
          mensaje={handleApiError(pedidos.error)}
          onReintentar={() => void pedidos.refetch()}
        />
      )}
      {pedidos.data !== undefined &&
        (pedidos.data.items.length === 0 ? (
          <EstadoVacio mensaje="No hay pedidos para mostrar" />
        ) : (
          <TablaPedidos
            pedidos={pedidos.data.items}
            mostrarCliente
            onVerDetalle={setDetalle}
            renderAcciones={(pedido) =>
              TRANSICIONES_ESTADO[pedido.estado].map((siguiente) => (
                <Button
                  key={siguiente}
                  tamano="sm"
                  variante={siguiente === 'CANCELADO' ? 'peligro' : 'primario'}
                  disabled={cambiarEstado.isPending}
                  onClick={() => cambiarEstado.mutate({ id: pedido.id, estado: siguiente })}
                >
                  {siguiente === 'CANCELADO' ? 'Cancelar' : `Pasar a ${ETIQUETAS_ESTADO[siguiente]}`}
                </Button>
              ))
            }
          />
        ))}

      <DetallePedidoModal pedido={detalle} onCerrar={() => setDetalle(null)} />
    </section>
  )
}
