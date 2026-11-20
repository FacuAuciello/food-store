//#formulario de producto con tanstack form para crear y editar
import { useForm } from '@tanstack/react-form'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import { primerError } from '../../../shared/utils/formulario'
import type { Categoria } from '../../categorias/types/categoria'
import type { Producto, ProductoInput } from '../types/producto'

interface ProductoFormProps {
  inicial?: Producto
  categorias: Categoria[]
  enviando: boolean
  error?: string
  onEnviar: (datos: ProductoInput) => void
  onCancelar: () => void
}

export function ProductoForm({
  inicial,
  categorias,
  enviando,
  error,
  onEnviar,
  onCancelar,
}: ProductoFormProps) {
  const form = useForm({
    defaultValues: {
      categoria_id: inicial?.categoria_id ?? categorias[0]?.id ?? 0,
      nombre: inicial?.nombre ?? '',
      descripcion: inicial?.descripcion ?? '',
      precio_base: inicial?.precio_base ?? 0,
      imagen_url: inicial?.imagen_url ?? '',
      stock: inicial?.stock ?? 0,
      disponible: inicial?.disponible ?? true,
    },
    onSubmit: ({ value }) => {
      const descripcion = value.descripcion.trim()
      const imagen = value.imagen_url.trim()
      onEnviar({
        categoria_id: value.categoria_id,
        nombre: value.nombre.trim(),
        descripcion: descripcion.length > 0 ? descripcion : null,
        precio_base: value.precio_base,
        imagen_url: imagen.length > 0 ? imagen : null,
        stock: value.stock,
        disponible: value.disponible,
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
          onChange: ({ value }) =>
            value.trim().length === 0 ? 'El nombre es obligatorio' : undefined,
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

      <form.Field
        name="categoria_id"
        validators={{
          onChange: ({ value }) => (value > 0 ? undefined : 'Elegi una categoria'),
        }}
      >
        {(field) => (
          <div className="flex flex-col gap-1">
            <label htmlFor="categoria_id" className="text-sm font-medium text-slate-700">
              Categoria
            </label>
            <select
              id="categoria_id"
              name="categoria_id"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(Number(e.target.value))}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
            {primerError(field.state.meta.errors) !== undefined && (
              <p className="text-xs text-red-600">{primerError(field.state.meta.errors)}</p>
            )}
          </div>
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

      <div className="grid grid-cols-2 gap-3">
        <form.Field
          name="precio_base"
          validators={{
            onChange: ({ value }) => (value >= 0 ? undefined : 'El precio no puede ser negativo'),
          }}
        >
          {(field) => (
            <Input
              label="Precio"
              name="precio_base"
              type="number"
              min={0}
              step="0.01"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) =>
                field.handleChange(e.target.value === '' ? 0 : Number(e.target.value))
              }
              error={primerError(field.state.meta.errors)}
            />
          )}
        </form.Field>
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
              onChange={(e) =>
                field.handleChange(e.target.value === '' ? 0 : Number(e.target.value))
              }
              error={primerError(field.state.meta.errors)}
            />
          )}
        </form.Field>
      </div>

      <form.Field name="imagen_url">
        {(field) => (
          <Input
            label="URL de la imagen"
            name="imagen_url"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
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
