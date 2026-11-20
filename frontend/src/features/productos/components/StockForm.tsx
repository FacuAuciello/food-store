//#formulario pequeno para cambiar el stock y la disponibilidad de un producto
import { useForm } from '@tanstack/react-form'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import { primerError } from '../../../shared/utils/formulario'
import type { Producto, StockInput } from '../types/producto'

interface StockFormProps {
  producto: Producto
  enviando: boolean
  error?: string
  onEnviar: (datos: StockInput) => void
  onCancelar: () => void
}

export function StockForm({ producto, enviando, error, onEnviar, onCancelar }: StockFormProps) {
  const form = useForm({
    defaultValues: { stock: producto.stock, disponible: producto.disponible },
    onSubmit: ({ value }) => onEnviar({ stock: value.stock, disponible: value.disponible }),
  })

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <p className="text-sm text-slate-600">
        Producto: <strong>{producto.nombre}</strong>
      </p>
      <form.Field
        name="stock"
        validators={{
          onChange: ({ value }) =>
            Number.isInteger(value) && value >= 0
              ? undefined
              : 'El stock debe ser un entero mayor o igual a 0',
        }}
      >
        {(field) => (
          <Input
            label="Stock"
            name="stock"
            type="number"
            min={0}
            step="1"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value === '' ? 0 : Number(e.target.value))}
            error={primerError(field.state.meta.errors)}
          />
        )}
      </form.Field>
      <form.Field name="disponible">
        {(field) => (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={field.state.value}
              onChange={(e) => field.handleChange(e.target.checked)}
            />
            Disponible para la venta
          </label>
        )}
      </form.Field>
      {error !== undefined && (
        <p role="alert" className="rounded bg-red-50 p-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Button variante="secundario" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button type="submit" disabled={enviando}>
          {enviando ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}
