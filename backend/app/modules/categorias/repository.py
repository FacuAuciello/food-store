#repositorio de categorias: busqueda por nombre y listado de activas
from typing import Optional, Sequence

from sqlmodel import Session, col, select

from app.core.base_repository import BaseRepository
from app.modules.categorias.models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Categoria)

    def get_by_nombre(self, nombre: str) -> Optional[Categoria]:
        consulta = select(Categoria).where(Categoria.nombre == nombre)
        return self.session.exec(consulta).first()

    def list_activas(self) -> Sequence[Categoria]:
        consulta = (
            select(Categoria)
            .where(col(Categoria.activo).is_(True))
            .order_by(col(Categoria.nombre))
        )
        return self.session.exec(consulta).all()
