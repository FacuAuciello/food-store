//#funciones que llaman a los endpoints de auth; el token viaja solo en la cookie httponly
import { axiosInstance } from '../../../shared/api/axiosInstance'
import type { Usuario } from '../../usuarios/types/usuario'
import type { MensajeRespuesta, RegistroDatos } from '../types/auth'

export async function loginRequest(username: string, password: string): Promise<void> {
  //#el login usa formulario oauth2 (x-www-form-urlencoded)
  const cuerpo = new URLSearchParams({ username, password })
  await axiosInstance.post<MensajeRespuesta>('/auth/token', cuerpo, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}

export async function obtenerPerfil(): Promise<Usuario> {
  const { data } = await axiosInstance.get<Usuario>('/auth/me')
  return data
}

export async function cerrarSesion(): Promise<void> {
  await axiosInstance.post<MensajeRespuesta>('/auth/logout')
}

export async function registrarUsuario(datos: RegistroDatos): Promise<Usuario> {
  const { data } = await axiosInstance.post<Usuario>('/auth/register', datos)
  return data
}
