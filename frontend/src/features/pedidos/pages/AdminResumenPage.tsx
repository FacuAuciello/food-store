//#panel de resumen del admin: tarjetas con los indicadores de los pedidos
import { handleApiError } from '../../../shared/api/handleApiError'
import { EstadoError } from '../../../shared/components/EstadoError'
import { Skeleton } from '../../../shared/components/Skeleton'
import { formatearPrecio } from '../../../shared/utils/formato'
import { TarjetaResumen } from '../components/TarjetaResumen'
import { useResumenPedidos } from '../hooks/usePedidos'

export function AdminResumenPage() {
  const resumen = useResumenPedidos()

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold">Resumen del negocio</h1>

      {resumen.isLoading && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, indice) => (
            <Skeleton key={indice} className="h-24 w-full" />
          ))}
        </div>
      )}
      {resumen.isError && (
        <EstadoError
          mensaje={handleApiError(resumen.error)}
          onReintentar={() => void resumen.refetch()}
        />
      )}
      {resumen.data !== undefined && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <TarjetaResumen
            titulo="Pendientes"
            valor={String(resumen.data.pendientes)}
            color="text-yellow-600"
          />
          <TarjetaResumen
            titulo="En preparacion"
            valor={String(resumen.data.en_preparacion)}
            color="text-blue-600"
          />
          <TarjetaResumen
            titulo="Entregados"
            valor={String(resumen.data.entregados)}
            color="text-green-600"
          />
          <TarjetaResumen
            titulo="Cancelados"
            valor={String(resumen.data.cancelados)}
            color="text-red-600"
          />
          <TarjetaResumen titulo="Pedidos de hoy" valor={String(resumen.data.pedidos_hoy)} />
          <TarjetaResumen
            titulo="Ingresos (pedidos entregados)"
            valor={formatearPrecio(resumen.data.ingresos_entregados)}
            color="text-orange-600"
          />
        </div>
      )}
    </section>
  )
}
