//#boton base con variantes de color y tamano
import type { ButtonHTMLAttributes } from 'react'

type Variante = 'primario' | 'secundario' | 'peligro' | 'fantasma'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante
  tamano?: 'sm' | 'md'
}

const estilosVariante: Record<Variante, string> = {
  primario: 'bg-orange-600 text-white hover:bg-orange-700',
  secundario: 'bg-slate-200 text-slate-800 hover:bg-slate-300',
  peligro: 'bg-red-600 text-white hover:bg-red-700',
  fantasma: 'bg-transparent text-slate-700 hover:bg-slate-100',
}

const estilosTamano = {
  sm: 'px-2.5 py-1 text-sm',
  md: 'px-4 py-2 text-sm',
}

export function Button({
  variante = 'primario',
  tamano = 'md',
  type = 'button',
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${estilosVariante[variante]} ${estilosTamano[tamano]} ${className}`}
      {...props}
    />
  )
}
