#servicio de pedidos: rn-01 a rn-06, mapa de transiciones, stock transaccional y resumen
from datetime import date, datetime, time
from typing import Optional

from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import (
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado
from app.modules.usuarios.models import Usuario

#mapa de transiciones validas de la maquina de estados (rn-02)
TRANSICIONES: dict[str, set[str]] = {
    "PENDIENTE": {"EN_PREPARACION", "CANCELADO"},
    "EN_PREPARACION": {"ENTREGADO", "CANCELADO"},
    "ENTREGADO": set(),
    "CANCELADO": set(),
}


class PedidoNoEncontrado(Exception):
    pass


class PedidoAjeno(Exception):
    pass


class StockInsuficiente(Exception):
    pass


class ProductoNoDisponible(Exception):
    pass


class ProductoRepetido(Exception):
    pass


class TransicionInvalida(Exception):
    pass


class PedidoService:
    def __init__(self, uow: Optional[PedidoUnitOfWork] = None) -> None:
        self.uow = uow or PedidoUnitOfWork()

    def crear_pedido(self, usuario_id: int, datos: PedidoCreate) -> PedidoRead:
        #rn-01: todo en una sola transaccion; si algo falla no se persiste nada
        with self.uow as uow:
            ids = [item.producto_id for item in datos.items]
            if len(ids) != len(set(ids)):
                raise ProductoRepetido("Hay productos repetidos en el pedido")

            pedido = Pedido(
                usuario_id=usuario_id,
                estado="PENDIENTE",
                forma_pago=datos.forma_pago,
                direccion_entrega=datos.direccion_entrega,
                notas=datos.notas,
                total=0.0,
            )
            uow.pedidos.add(pedido)

            total = 0.0
            for item in datos.items:
                producto = uow.productos.get_by_id(item.producto_id)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(
                        f"Producto {item.producto_id} no encontrado o inactivo"
                    )
                if not producto.disponible:
                    raise ProductoNoDisponible(
                        f"El producto {producto.nombre} no esta disponible"
                    )
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(
                        f"Stock insuficiente de {producto.nombre}: quedan {producto.stock}"
                    )
                #se descuenta el stock y se copian nombre y precio en la linea
                producto.stock -= item.cantidad
                subtotal = producto.precio_base * item.cantidad
                detalle = DetallePedido(
                    producto_id=producto.id,
                    cantidad=item.cantidad,
                    nombre_producto=producto.nombre,
                    precio_unitario=producto.precio_base,
                    subtotal=subtotal,
                )
                pedido.items.append(detalle)
                total += subtotal

            pedido.total = total
            uow.pedidos.add(pedido)
            return PedidoRead.model_validate(pedido)

    def listar(
        self,
        usuario: Usuario,
        skip: int = 0,
        limit: int = 20,
        estado: Optional[str] = None,
    ) -> PedidosPaginados:
        #rn-04: el cliente ve solo los suyos; el admin ve todos
        with self.uow as uow:
            if usuario.role == "admin":
                pedidos, total = uow.pedidos.list_all(skip, limit, estado)
            else:
                pedidos, total = uow.pedidos.list_by_usuario(
                    usuario.id, skip, limit, estado
                )
            return PedidosPaginados(
                total=total,
                items=[PedidoRead.model_validate(p) for p in pedidos],
            )

    def obtener(self, pedido_id: int, usuario: Usuario) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado()
            if usuario.role != "admin" and pedido.usuario_id != usuario.id:
                raise PedidoAjeno()
            return PedidoRead.model_validate(pedido)

    def cambiar_estado(self, pedido_id: int, nuevo_estado: str) -> PedidoRead:
        #uso del admin: avanza o cancela segun la maquina de estados
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado()
            self._aplicar_transicion(uow, pedido, nuevo_estado)
            return PedidoRead.model_validate(pedido)

    def cancelar(self, pedido_id: int, usuario: Usuario) -> PedidoRead:
        #uso del cliente: solo su pedido y solo desde pendiente
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado()
            if pedido.usuario_id != usuario.id:
                raise PedidoAjeno()
            if pedido.estado != "PENDIENTE":
                raise TransicionInvalida(
                    "Solo se puede cancelar un pedido en estado PENDIENTE"
                )
            self._aplicar_transicion(uow, pedido, "CANCELADO")
            return PedidoRead.model_validate(pedido)

    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            conteos = uow.pedidos.count_by_estado()
            inicio_hoy = datetime.combine(date.today(), time.min)
            return ResumenPedidos(
                pendientes=conteos.get("PENDIENTE", 0),
                en_preparacion=conteos.get("EN_PREPARACION", 0),
                entregados=conteos.get("ENTREGADO", 0),
                cancelados=conteos.get("CANCELADO", 0),
                pedidos_hoy=uow.pedidos.count_desde(inicio_hoy),
                ingresos_entregados=uow.pedidos.sum_total_por_estado("ENTREGADO"),
            )

    def _aplicar_transicion(
        self, uow: PedidoUnitOfWork, pedido: Pedido, nuevo_estado: str
    ) -> None:
        #valida la transicion antes de modificar nada (rn-02)
        if nuevo_estado not in TRANSICIONES.get(pedido.estado, set()):
            raise TransicionInvalida(
                f"No se puede pasar de {pedido.estado} a {nuevo_estado}"
            )
        if nuevo_estado == "CANCELADO":
            #rn-03: se restituye el stock de cada linea en la misma transaccion
            for linea in pedido.items:
                producto = uow.productos.get_by_id(linea.producto_id)
                if producto is not None:
                    producto.stock += linea.cantidad
        pedido.estado = nuevo_estado
        pedido.updated_at = datetime.now()
        uow.pedidos.add(pedido)
