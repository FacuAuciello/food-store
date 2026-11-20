#repositorio de productos: busqueda paginada con filtros por nombre, categoria y disponibilidad
from typing import Optional, Sequence

from sqlalchemy import func
from sqlmodel import Session, col, select

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Producto)

    def search(
        self,
        skip: int = 0,
        limit: int = 20,
        search: Optional[str] = None,
        categoria_id: Optional[int] = None,
        disponible: Optional[bool] = None,
    ) -> tuple[Sequence[Producto], int]:
        #solo productos activos; devuelve la pagina y el total sin paginar
        condiciones = [col(Producto.activo).is_(True)]
        if search:
            condiciones.append(col(Producto.nombre).ilike(f"%{search}%"))
        if categoria_id is not None:
            condiciones.append(Producto.categoria_id == categoria_id)
        if disponible is not None:
            condiciones.append(Producto.disponible == disponible)

        total = self.session.exec(
            select(func.count()).select_from(Producto).where(*condiciones)
        ).one()
        items = self.session.exec(
            select(Producto)
            .where(*condiciones)
            .order_by(col(Producto.id))
            .offset(skip)
            .limit(limit)
        ).all()
        return items, int(total)
