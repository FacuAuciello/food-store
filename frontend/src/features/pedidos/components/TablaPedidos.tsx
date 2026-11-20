//#tabla de pedidos con tanstack table, reutilizada en mis pedidos y en el panel de admin
import type { ColumnDef } from '@tanstack/react-table'
import type { ReactNode } from 'react'
import { DataTable } from '../../../shared/components/DataTable'
import { BadgeEstado } from '../../../shared/ui/BadgeEstado'
import { Button } from '../../../shared/ui/Button'
import { formatearFecha, formatearPrecio } from '../../../shared/utils/formato'
import type { Pedido } from '../types/pedido'

interface TablaPedidosProps {
  pedidos: Pedido[]
  mostrarCliente?: boolean
  paginarEnCliente?: boolean
  onVerDetalle: (pedido: Pedido) => void
  renderAcciones?: (pedido: Pedido) => ReactNode
}

export function TablaPedidos({
  pedidos,
  mostrarCliente = false,
  paginarEnCliente = true,
  onVerDetalle,
  renderAcciones,
}: TablaPedidosProps) {
  const columnas: ColumnDef<Pedido>[] = [
    {
      accessorKey: 'id',
      header: 'Pedido',
      cell: ({ row }) => `#${row.original.id}`,
    },
    ...(mostrarCliente
      ? [
          {
            id: 'cliente',
            header: 'Cliente',
            cell: ({ row }) => `Usuario ${row.original.usuario_id}`,
          } satisfies ColumnDef<Pedido>,
        ]
      : []),
    {
      accessorKey: 'created_at',
      header: 'Fecha',
      cell: ({ row }) => formatearFecha(row.original.created_at),
    },
    {
      accessorKey: 'forma_pago',
      header: 'Pago',
      cell: ({ row }) => (row.original.forma_pago === 'EFECTIVO' ? 'Efectivo' : 'Transferencia'),
    },
    {
      accessorKey: 'total',
      header: 'Total',
      cell: ({ row }) => formatearPrecio(row.original.total),
    },
    {
      accessorKey: 'estado',
      header: 'Estado',
      cell: ({ row }) => <BadgeEstado estado={row.original.estado} />,
    },
    {
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-2">
          <Button tamano="sm" variante="secundario" onClick={() => onVerDetalle(row.original)}>
            Ver detalle
          </Button>
          {renderAcciones?.(row.original)}
        </div>
      ),
    },
  ]

  return <DataTable datos={pedidos} columnas={columnas} paginarEnCliente={paginarEnCliente} />
}
