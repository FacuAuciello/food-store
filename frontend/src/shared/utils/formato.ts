//#funciones para dar formato a precios y fechas en pantalla
const formatoPrecio = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
})

export function formatearPrecio(valor: number): string {
  return formatoPrecio.format(valor)
}

export function formatearFecha(iso: string): string {
  return new Date(iso).toLocaleString('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}
