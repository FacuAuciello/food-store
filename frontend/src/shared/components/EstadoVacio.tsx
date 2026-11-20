//#mensaje para listas sin resultados
import type { ReactNode } from 'react'

interface EstadoVacioProps {
  mensaje: string
  children?: ReactNode
}

export function EstadoVacio({ mensaje, children }: EstadoVacioProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
      <p>{mensaje}</p>
      {children}
    </div>
  )
}
