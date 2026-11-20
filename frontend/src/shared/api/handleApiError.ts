//#convierte el detail de la api en un mensaje legible para mostrar en pantalla
import { isAxiosError } from 'axios'

interface DetalleValidacion {
  msg?: string
  loc?: unknown[]
}

export function handleApiError(error: unknown): string {
  if (isAxiosError<{ detail?: unknown }>(error)) {
    if (error.response === undefined) {
      return 'No se pudo conectar con el servidor'
    }
    const detalle = error.response.data?.detail
    if (typeof detalle === 'string') {
      return detalle
    }
    //#los errores 422 de fastapi llegan como una lista de objetos
    if (Array.isArray(detalle)) {
      const mensajes = (detalle as DetalleValidacion[])
        .map((d) => d.msg)
        .filter((m): m is string => typeof m === 'string')
      if (mensajes.length > 0) {
        return mensajes.join('. ')
      }
    }
    return `Error ${error.response.status}`
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Ocurrio un error inesperado'
}
