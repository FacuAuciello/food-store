//#pantalla de login con tanstack form: valida los campos y abre la sesion con cookie
import { useForm } from '@tanstack/react-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { handleApiError } from '../../../shared/api/handleApiError'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { Input } from '../../../shared/ui/Input'
import { primerError } from '../../../shared/utils/formulario'
import { useAuthStore } from '../../../store/authStore'
import { useLogin } from '../hooks/useAuth'

interface EstadoNavegacion {
  desde?: string
  registrado?: boolean
}

export function LoginPage() {
  const navigate = useNavigate()
  const ubicacion = useLocation()
  const estadoNav = ubicacion.state as EstadoNavegacion | null
  const login = useLogin()

  const form = useForm({
    defaultValues: { username: '', password: '' },
    onSubmit: ({ value }) => {
      login.mutate(value, {
        onSuccess: () => {
          const usuario = useAuthStore.getState().usuario
          const destino = estadoNav?.desde ?? (usuario?.role === 'admin' ? '/admin/resumen' : '/')
          navigate(destino, { replace: true })
        },
      })
    },
  })

  return (
    <div className="mx-auto max-w-sm">
      <Card>
        <h1 className="mb-4 text-xl font-bold">Ingresar</h1>
        {estadoNav?.registrado === true && (
          <p className="mb-3 rounded bg-green-50 p-2 text-sm text-green-700">
            Registro exitoso. Ya podes ingresar con tu cuenta.
          </p>
        )}
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
              onChange: ({ value }) => (value.trim().length === 0 ? 'Ingresa tu usuario' : undefined),
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
            name="password"
            validators={{
              onChange: ({ value }) => (value.length === 0 ? 'Ingresa tu contrasena' : undefined),
            }}
          >
            {(field) => (
              <Input
                label="Contrasena"
                name="password"
                type="password"
                autoComplete="current-password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={primerError(field.state.meta.errors)}
              />
            )}
          </form.Field>
          {login.isError && (
            <p role="alert" className="rounded bg-red-50 p-2 text-sm text-red-700">
              {handleApiError(login.error)}
            </p>
          )}
          <Button type="submit" disabled={login.isPending}>
            {login.isPending ? 'Ingresando...' : 'Ingresar'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600">
          No tenes cuenta?{' '}
          <Link to="/register" className="font-medium text-orange-600 hover:underline">
            Registrate
          </Link>
        </p>
      </Card>
    </div>
  )
}
