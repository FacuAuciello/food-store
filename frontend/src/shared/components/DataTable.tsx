//#tabla generica con tanstack table y paginacion del lado del cliente
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { ColumnDef, PaginationState } from '@tanstack/react-table'
import { useState } from 'react'
import { Paginacion } from './Paginacion'

interface DataTableProps<TData> {
  datos: TData[]
  columnas: ColumnDef<TData>[]
  tamanoPagina?: number
  //#false cuando la paginacion la resuelve el servidor
  paginarEnCliente?: boolean
}

export function DataTable<TData>({
  datos,
  columnas,
  tamanoPagina = 10,
  paginarEnCliente = true,
}: DataTableProps<TData>) {
  const [paginacion, setPaginacion] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: tamanoPagina,
  })
  //#si la lista se achica (por ejemplo al eliminar) la pagina se acota a la ultima disponible
  const totalPaginas = Math.max(1, Math.ceil(datos.length / tamanoPagina))
  const pageIndex = Math.min(paginacion.pageIndex, totalPaginas - 1)

  const tabla = useReactTable({
    data: datos,
    columns: columnas,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: paginarEnCliente ? getPaginationRowModel() : undefined,
    state: { pagination: { pageIndex, pageSize: tamanoPagina } },
    onPaginationChange: setPaginacion,
    //#al recargar los datos tras editar, la tabla no vuelve a la primera pagina
    autoResetPageIndex: false,
    manualPagination: !paginarEnCliente,
  })

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase text-slate-600">
            {tabla.getHeaderGroups().map((grupo) => (
              <tr key={grupo.id}>
                {grupo.headers.map((header) => (
                  <th key={header.id} className="px-3 py-2 font-semibold">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {tabla.getRowModel().rows.map((fila) => (
              <tr key={fila.id} className="border-t border-slate-100">
                {fila.getVisibleCells().map((celda) => (
                  <td key={celda.id} className="px-3 py-2 align-middle">
                    {flexRender(celda.column.columnDef.cell, celda.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {paginarEnCliente && (
        <Paginacion
          pagina={pageIndex}
          totalPaginas={tabla.getPageCount()}
          onCambiar={(pagina) => tabla.setPageIndex(pagina)}
        />
      )}
    </div>
  )
}
