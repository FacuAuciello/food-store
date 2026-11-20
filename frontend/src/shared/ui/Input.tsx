//#campo de texto con etiqueta y mensaje de error
import { useId } from 'react'
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  const id = useId()
  return (
    <div className="flex flex-col gap-1">
      {label !== undefined && (
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400 ${
          error !== undefined ? 'border-red-500' : 'border-slate-300'
        } ${className}`}
        {...props}
      />
      {error !== undefined && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
