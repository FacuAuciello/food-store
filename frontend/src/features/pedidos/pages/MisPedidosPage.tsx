//#pantalla mis pedidos: lista paginada en el servidor, detalle y cancelacion solo en pendiente
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { handleApiError } from '../../../shared/api/handleApiError'
import { EstadoError } from '../../../shared/components/EstadoError'
import { EstadoVacio } from '../../../shared/components/EstadoVacio'
import { Paginacion } from '../../../shared/components/Paginacion'
import { Skeleton } from '../../../shared/components/Skeleton'
import { Button } from '../../../shared/ui/Button'
import { Modal } from '../../../shared/ui/Modal'
import { DetallePedidoModal } from '../components/DetallePedidoModal'
import { TablaPedidos } from '../components/TablaPedidos'
import { useCancelarPedido, usePedidos } from '../hooks/usePedidos'
import type { Pedido } from '../types/pedido'

const LIMITE = 10

export function MisPedidosPage() {
  const [pagina, setPagina] = useState(0)
  const [detalle, setDetalle] = useState<Pedido | null>(null)
  const [aCancelar, setACancelar] = useState<Pedido | null>(null)

  const pedidos = usePedidos({ skip: pagina * LIMITE, limit: LIMITE })
  const cancelar = useCancelarPedido()

  const totalPaginas = Math.ceil((pedidos.data?.total ?? 0) / LIMITE)

  const confirmarCancelacion = () => {
    if (aCancelar !== null) {
      cancelar.mutate(aCancelar.id, { onSuccess: () => setACancelar(null) })
    }
  }

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold">Mis pedidos</h1>

      {pedidos.isLoading && <Skeleton className="h-40 w-full" />}
      {pedidos.isError && (
        <EstadoError
          mensaje={handleApiError(pedidos.error)}
          onReintentar={() => void pedidos.refetch()}
        />
      )}
      {pedidos.data !== undefined &&
        (pedidos.data.items.length === 0 ? (
          <EstadoVacio mensaje="Todavia no hiciste ningun pedido">
            <Link to="/" className="font-medium text-orange-600 hover:underline">
              Ir al catalogo
            </Link>
          </EstadoVacio>
        ) : (
          <>
            <TablaPedidos
              pedidos={pedidos.data.items}
              paginarEnCliente={false}
              onVerDetalle={setDetalle}
              renderAcciones={(pedido) =>
                pedido.estado === 'PENDIENTE' ? (
                  <Button
                    tamano="sm"
                    variante="peligro"
                    onClick={() => {
                      cancelar.reset()
                      setACancelar(pedido)
                    }}
                  >
                    Cancelar
                  </Button>
                ) : null
              }
            />
            <Paginacion pagina={pagina} totalPaginas={totalPaginas} onCambiar={setPagina} />
          </>
        ))}

      <DetallePedidoModal pedido={detalle} onCerrar={() => setDetalle(null)} />

      <Modal
        abierto={aCancelar !== null}
        titulo="Cancelar pedido"
        onCerrar={() => setACancelar(null)}
      >
        <p className="mb-3 text-sm">
          Vas a cancelar el pedido #{aCancelar?.id}. El stock de sus productos se restituye.
        </p>
        {cancelar.isError && (
          <p role="alert" className="mb-2 rounded bg-red-50 p-2 text-sm text-red-700">
            {handleApiError(cancelar.error)}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button variante="secundario" onClick={() => setACancelar(null)}>
            Volver
          </Button>
          <Button variante="peligro" disabled={cancelar.isPending} onClick={confirmarCancelacion}>
            Cancelar pedido
          </Button>
        </div>
      </Modal>
    </section>
  )
}
