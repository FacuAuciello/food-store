#unit of work de categorias: expone el repositorio de categorias sobre una sesion
from sqlmodel import Session

from app.core.unit_of_work import UnitOfWork
from app.modules.categorias.repository import CategoriaRepository


class CategoriaUnitOfWork(UnitOfWork):
    categorias: CategoriaRepository

    def crear_repositorios(self, session: Session) -> None:
        self.categorias = CategoriaRepository(session)
