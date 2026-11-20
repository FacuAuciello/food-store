//#utilidad para obtener el primer mensaje de error de un campo de tanstack form
export function primerError(errores: unknown[]): string | undefined {
  for (const error of errores) {
    if (typeof error === 'string' && error.length > 0) {
      return error
    }
  }
  return undefined
}
