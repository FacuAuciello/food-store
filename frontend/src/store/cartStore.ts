//#store del carrito con zustand, persistido en localstorage para sobrevivir a la recarga
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ItemCarrito {
  producto_id: number
  nombre: string
  precio_unitario: number
  cantidad: number
}

interface CartState {
  items: ItemCarrito[]
  agregar: (item: Omit<ItemCarrito, 'cantidad'>, cantidad?: number) => void
  quitar: (productoId: number) => void
  cambiarCantidad: (productoId: number, cantidad: number) => void
  vaciar: () => void
  total: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      agregar: (item, cantidad = 1) => {
        const existente = get().items.find((i) => i.producto_id === item.producto_id)
        if (existente === undefined) {
          set({ items: [...get().items, { ...item, cantidad }] })
          return
        }
        set({
          items: get().items.map((i) =>
            i.producto_id === item.producto_id
              ? { ...i, cantidad: i.cantidad + cantidad }
              : i,
          ),
        })
      },

      quitar: (productoId) => {
        set({ items: get().items.filter((i) => i.producto_id !== productoId) })
      },

      cambiarCantidad: (productoId, cantidad) => {
        if (cantidad < 1) {
          return
        }
        set({
          items: get().items.map((i) =>
            i.producto_id === productoId ? { ...i, cantidad } : i,
          ),
        })
      },

      vaciar: () => {
        set({ items: [] })
      },

      total: () =>
        get().items.reduce((suma, i) => suma + i.precio_unitario * i.cantidad, 0),
    }),
    {
      name: 'cart-storage',
      partialize: (estado) => ({ items: estado.items }),
    },
  ),
)
