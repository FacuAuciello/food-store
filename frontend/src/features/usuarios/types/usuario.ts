//#tipos de usuario con los mismos nombres de campo que los schemas del backend
export type RolUsuario = 'user' | 'admin'

export interface Usuario {
  id: number
  username: string
  full_name: string
  email: string
  role: RolUsuario
  disabled: boolean
  created_at: string
}

export type UsuarioSesion = Pick<Usuario, 'id' | 'username' | 'full_name' | 'email' | 'role'>
