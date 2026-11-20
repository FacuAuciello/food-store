//#formulario de checkout con tanstack form: direccion, forma de pago y notas
import { useForm } from '@tanstack/react-form'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import { primerError } from '../../../shared/utils/formulario'
import type { FormaPago } from '../types/pedido'

export interface DatosCheckout {
  direccion_entrega: string
  forma_pago: FormaPago
  notas: string | null
}

interface CheckoutFormProps {
  enviando: boolean
  error?: string
  onEnviar: (datos: DatosCheckout) => void
}

const formaPagoInicial: FormaPago = 'EFECTIVO'

export function CheckoutForm({ enviando, error, onEnviar }: CheckoutFormProps) {
  const form = useForm({
    defaultValues: {
      direccion_entrega: '',
      forma_pago: formaPagoInicial,
      notas: '',
    },
    onSubmit: ({ value }) => {
      const notas = value.notas.trim()
      onEnviar({
        direccion_entrega: value.direccion_entrega.trim(),
        forma_pago: value.forma_pago,
        notas: notas.length > 0 ? notas : null,
      })
    },
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
      <form.Field
        name="direccion_entrega"
        validators={{
          onChange: ({ value }) => {
            const largo = value.trim().length
            return largo < 5 || largo > 200
              ? 'La direccion debe tener entre 5 y 200 caracteres'
              : undefined
          },
        }}
      >
        {(field) => (
          <Input
            label="Direccion de entrega"
            name="direccion_entrega"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={primerError(field.state.meta.errors)}
          />
        )}
      </form.Field>

      <form.Field name="forma_pago">
        {(field) => (
          <div className="flex flex-col gap-1">
            <label htmlFor="forma_pago" className="text-sm font-medium text-slate-700">
              Forma de pago
            </label>
            <select
              id="forma_pago"
              name="forma_pago"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) =>
                field.handleChange(e.target.value === 'TRANSFERENCIA' ? 'TRANSFERENCIA' : 'EFECTIVO')
              }
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="EFECTIVO">Efectivo</option>
              <option value="TRANSFERENCIA">Transferencia</option>
            </select>
          </div>
        )}
      </form.Field>

      <form.Field name="notas">
        {(field) => (
          <div className="flex flex-col gap-1">
            <label htmlFor="notas" className="text-sm font-medium text-slate-700">
              Notas (opcional)
            </label>
            <textarea
              id="notas"
              name="notas"
              rows={3}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        )}
      </form.Field>

      {error !== undefined && (
        <p role="alert" className="rounded bg-red-50 p-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <Button type="submit" disabled={enviando}>
        {enviando ? 'Confirmando...' : 'Confirmar pedido'}
      </Button>
    </form>
  )
}
