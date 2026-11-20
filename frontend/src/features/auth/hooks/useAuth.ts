//#hooks de tanstack query para el login y el registro de usuarios
import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '../../../store/authStore'
import { registrarUsuario } from '../api/auth'
import type { RegistroDatos } from '../types/auth'

interface CredencialesLogin {
  username: string
  password: string
}

export function useLogin() {
  const login = useAuthStore((estado) => estado.login)
  return useMutation({
    mutationFn: ({ username, password }: CredencialesLogin) => login(username, password),
  })
}

export function useRegistro() {
  return useMutation({
    mutationFn: (datos: RegistroDatos) => registrarUsuario(datos),
  })
}
