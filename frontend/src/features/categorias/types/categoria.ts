//#tipos de categoria con los mismos nombres de campo que los schemas del backend
export interface Categoria {
  id: number
  nombre: string
  descripcion: string | null
  activo: boolean
}

export interface CategoriaInput {
  nombre: string
  descripcion: string | null
}
