//#pantalla de registro publico con tanstack form y validaciones de cada campo
import { useForm } from '@tanstack/react-form'
import { Link, useNavigate } from 'react-router-dom'
import { handleApiError } from '../../../shared/api/handleApiError'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { Input } from '../../../shared/ui/Input'
import { primerError } from '../../../shared/utils/formulario'
import { useRegistro } from '../hooks/useAuth'

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function RegisterPage() {
  const navigate = useNavigate()
  const registro = useRegistro()

  const form = useForm({
    defaultValues: {
      username: '',
      full_name: '',
      email: '',
      password: '',
      confirmacion: '',
    },
    onSubmit: ({ value }) => {
      registro.mutate(
        {
          username: value.username.trim(),
          full_name: value.full_name.trim(),
          email: value.email.trim(),
          password: value.password,
        },
        { onSuccess: () => navigate('/login', { state: { registrado: true } }) },
      )
    },
  })

  return (
    <div className="mx-auto max-w-sm">
      <Card>
        <h1 className="mb-4 text-xl font-bold">Crear cuenta</h1>
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            void form.handleSubmit()
          }}
        >
          <form.Field
            name="username"
            validators={{
              onChange: ({ value }) =>
                value.trim().length < 3 ? 'El usuario necesita al menos 3 caracteres' : undefined,
            }}
          >
            {(field) => (
              <Input
                label="Usuario"
                name="username"
                autoComplete="username"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={primerError(field.state.meta.errors)}
              />
            )}
          </form.Field>
          <form.Field
            name="full_name"
            validators={{
              onChange: ({ value }) =>
                value.trim().length === 0 ? 'Ingresa tu nombre completo' : undefined,
            }}
          >
            {(field) => (
              <Input
                label="Nombre completo"
                name="full_name"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={primerError(field.state.meta.errors)}
              />
            )}
          </form.Field>
          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) =>
                REGEX_EMAIL.test(value.trim()) ? undefined : 'Ingresa un email valido',
            }}
          >
            {(field) => (
              <Input
                label="Email"
                name="email"
                type="email"
                autoComplete="email"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={primerError(field.state.meta.errors)}
              />
            )}
          </form.Field>
          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) =>
                value.length < 8 ? 'La contrasena necesita al menos 8 caracteres' : undefined,
            }}
          >
            {(field) => (
              <Input
                label="Contrasena"
                name="password"
                type="password"
                autoComplete="new-password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={primerError(field.state.meta.errors)}
              />
            )}
          </form.Field>
          <form.Field
            name="confirmacion"
            validators={{
              onChangeListenTo: ['password'],
              onChange: ({ value, fieldApi }) =>
                value !== fieldApi.form.getFieldValue('password')
                  ? 'Las contrasenas no coinciden'
                  : undefined,
            }}
          >
            {(field) => (
              <Input
                label="Repetir contrasena"
                name="confirmacion"
                type="password"
                autoComplete="new-password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={primerError(field.state.meta.errors)}
              />
            )}
          </form.Field>
          {registro.isError && (
            <p role="alert" className="rounded bg-red-50 p-2 text-sm text-red-700">
              {handleApiError(registro.error)}
            </p>
          )}
          <Button type="submit" disabled={registro.isPending}>
            {registro.isPending ? 'Creando cuenta...' : 'Registrarme'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600">
          Ya tenes cuenta?{' '}
          <Link to="/login" className="font-medium text-orange-600 hover:underline">
            Ingresar
          </Link>
        </p>
      </Card>
    </div>
  )
}
