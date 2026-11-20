#repositorio de pedidos: listados paginados, conteos por estado y suma de ingresos
from datetime import datetime
from typing import Optional, Sequence

from sqlalchemy import func
from sqlmodel import Session, col, select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Pedido)

    def _listar(
        self,
        skip: int,
        limit: int,
        estado: Optional[str],
        usuario_id: Optional[int],
    ) -> tuple[Sequence[Pedido], int]:
        condiciones = []
        if usuario_id is not None:
            condiciones.append(Pedido.usuario_id == usuario_id)
        if estado is not None:
            condiciones.append(Pedido.estado == estado)
        total = self.session.exec(
            select(func.count()).select_from(Pedido).where(*condiciones)
        ).one()
        items = self.session.exec(
            select(Pedido)
            .where(*condiciones)
            .order_by(col(Pedido.created_at).desc(), col(Pedido.id).desc())
            .offset(skip)
            .limit(limit)
        ).all()
        return items, int(total)

    def list_by_usuario(
        self,
        usuario_id: int,
        skip: int = 0,
        limit: int = 20,
        estado: Optional[str] = None,
    ) -> tuple[Sequence[Pedido], int]:
        return self._listar(skip, limit, estado, usuario_id)

    def list_all(
        self, skip: int = 0, limit: int = 20, estado: Optional[str] = None
    ) -> tuple[Sequence[Pedido], int]:
        return self._listar(skip, limit, estado, None)

    def count_by_estado(self) -> dict[str, int]:
        filas = self.session.exec(
            select(Pedido.estado, func.count()).group_by(Pedido.estado)
        ).all()
        return {estado: int(cantidad) for estado, cantidad in filas}

    def count_desde(self, desde: datetime) -> int:
        total = self.session.exec(
            select(func.count()).select_from(Pedido).where(Pedido.created_at >= desde)
        ).one()
        return int(total)

    def sum_total_por_estado(self, estado: str) -> float:
        suma = self.session.exec(
            select(func.coalesce(func.sum(Pedido.total), 0.0)).where(
                Pedido.estado == estado
            )
        ).one()
        return float(suma)
