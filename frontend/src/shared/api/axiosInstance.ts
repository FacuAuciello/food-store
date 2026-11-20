//#cliente http unico: baseurl desde env, cookies con credenciales e interceptor de 401
import axios, { AxiosError } from 'axios'
import { useAuthStore } from '../../store/authStore'

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1',
  withCredentials: true,
})

interface ErrorApi {
  detail?: unknown
}

axiosInstance.interceptors.response.use(
  (respuesta) => respuesta,
  (error: AxiosError<ErrorApi>) => {
    const status = error.response?.status
    const url = error.config?.url ?? ''
    const detalle = error.response?.data?.detail
    const esLoginOPerfil = url.includes('/auth/token') || url.includes('/auth/me')
    const cuentaDesactivada =
      status === 400 && detalle === 'Cuenta de usuario desactivada'

    //#sesion vencida o cuenta desactivada: se limpia el store y protectedroute lleva a /login
    if ((status === 401 && !esLoginOPerfil) || cuentaDesactivada) {
      useAuthStore.getState().limpiarSesion()
    }
    return Promise.reject(error)
  },
)
