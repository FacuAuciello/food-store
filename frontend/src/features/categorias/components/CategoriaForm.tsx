//#formulario de categoria con tanstack form para crear y editar
import { useForm } from '@tanstack/react-form'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import { primerError } from '../../../shared/utils/formulario'
import type { Categoria, CategoriaInput } from '../types/categoria'

interface CategoriaFormProps {
  inicial?: Categoria
  enviando: boolean
  error?: string
  onEnviar: (datos: CategoriaInput) => void
  onCancelar: () => void
}

export function CategoriaForm({ inicial, enviando, error, onEnviar, onCancelar }: CategoriaFormProps) {
  const form = useForm({
    defaultValues: {
      nombre: inicial?.nombre ?? '',
      descripcion: inicial?.descripcion ?? '',
    },
    onSubmit: ({ value }) => {
      const descripcion = value.descripcion.trim()
      onEnviar({
        nombre: value.nombre.trim(),
        descripcion: descripcion.length > 0 ? descripcion : null,
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
        name="nombre"
        validators={{
          onChange: ({ value }) => {
            const largo = value.trim().length
            return largo < 2 || largo > 100 ? 'El nombre debe tener entre 2 y 100 caracteres' : undefined
          },
        }}
      >
        {(field) => (
          <Input
            label="Nombre"
            name="nombre"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={primerError(field.state.meta.errors)}
          />
        )}
      </form.Field>
      <form.Field name="descripcion">
        {(field) => (
          <Input
            label="Descripcion"
            name="descripcion"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
          />
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
