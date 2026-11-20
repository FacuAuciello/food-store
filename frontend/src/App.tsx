//#componente raiz: confirma la sesion al montar y renderiza el router
import { useEffect } from 'react'
import { AppRouter } from './routes/AppRouter'
import { useAuthStore } from './store/authStore'

export default function App() {
  const checkSession = useAuthStore((estado) => estado.checkSession)

  //#unica llamada en useeffect: confirma con /auth/me si la cookie sigue vigente
  useEffect(() => {
    void checkSession()
  }, [checkSession])

  return <AppRouter />
}
