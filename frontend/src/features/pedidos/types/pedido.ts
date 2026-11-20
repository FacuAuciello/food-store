//#tipos de pedido con los mismos nombres de campo que los schemas del backend y mapa de transiciones
export type EstadoPedido = 'PENDIENTE' | 'EN_PREPARACION' | 'ENTREGADO' | 'CANCELADO'

export type FormaPago = 'EFECTIVO' | 'TRANSFERENCIA'

export interface DetallePedido {
  producto_id: number
  nombre_producto: string
  precio_unitario: number
  cantidad: number
  subtotal: number
}

export interface Pedido {
  id: number
  usuario_id: number
  estado: EstadoPedido
  forma_pago: FormaPago
  direccion_entrega: string
  notas: string | null
  total: number
  created_at: string
  updated_at: string
  items: DetallePedido[]
}

export interface ItemPedidoCreate {
  producto_id: number
  cantidad: number
}

export interface PedidoCreate {
  items: ItemPedidoCreate[]
  forma_pago: FormaPago
  direccion_entrega: string
  notas: string | null
}

export interface PedidosPaginados {
  total: number
  items: Pedido[]
}

export interface ResumenPedidos {
  pendientes: number
  en_preparacion: number
  entregados: number
  cancelados: number
  pedidos_hoy: number
  ingresos_entregados: number
}

export interface FiltrosPedidos {
  skip: number
  limit: number
  estado?: EstadoPedido
}

//#estados a los que puede pasar un pedido (misma maquina de estados que el backend)
export const TRANSICIONES_ESTADO: Record<EstadoPedido, EstadoPedido[]> = {
  PENDIENTE: ['EN_PREPARACION', 'CANCELADO'],
  EN_PREPARACION: ['ENTREGADO', 'CANCELADO'],
  ENTREGADO: [],
  CANCELADO: [],
}

export const ESTADOS_PEDIDO: EstadoPedido[] = [
  'PENDIENTE',
  'EN_PREPARACION',
  'ENTREGADO',
  'CANCELADO',
]

export const ETIQUETAS_ESTADO: Record<EstadoPedido, string> = {
  PENDIENTE: 'Pendiente',
  EN_PREPARACION: 'En preparacion',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
}
