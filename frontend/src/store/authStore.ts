//#store de sesion con zustand: usuario, login, logout y checksession; solo persiste el usuario
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { cerrarSesion, loginRequest, obtenerPerfil } from '../features/auth/api/auth'
import type { UsuarioSesion } from '../features/usuarios/types/usuario'
import { queryClient } from '../shared/api/queryClient'

interface AuthState {
  usuario: UsuarioSesion | null
  cargando: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  limpiarSesion: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,

      login: async (username, password) => {
        await loginRequest(username, password)
        const perfil = await obtenerPerfil()
        set({
          usuario: {
            id: perfil.id,
            username: perfil.username,
            full_name: perfil.full_name,
            email: perfil.email,
            role: perfil.role,
          },
        })
      },

      logout: async () => {
        try {
          await cerrarSesion()
        } finally {
          set({ usuario: null })
          queryClient.clear()
        }
      },

      checkSession: async () => {
        try {
          const perfil = await obtenerPerfil()
          set({
            usuario: {
              id: perfil.id,
              username: perfil.username,
              full_name: perfil.full_name,
              email: perfil.email,
              role: perfil.role,
            },
            cargando: false,
          })
        } catch {
          set({ usuario: null, cargando: false })
        }
      },

      limpiarSesion: () => {
        set({ usuario: null })
      },
    }),
    {
      name: 'auth-storage',
      //#solo se guarda el usuario, nunca el token (viaja en la cookie httponly)
      partialize: (estado) => ({ usuario: estado.usuario }),
    },
  ),
)
