#repositorio generico con las operaciones basicas de acceso a datos
from typing import Generic, Optional, Sequence, Type, TypeVar

from sqlmodel import Session, SQLModel, select

T = TypeVar("T", bound=SQLModel)


class BaseRepository(Generic[T]):
    def __init__(self, session: Session, model: Type[T]) -> None:
        self.session = session
        self.model = model

    def get_by_id(self, id: int) -> Optional[T]:
        return self.session.get(self.model, id)

    def get_all(self, skip: int = 0, limit: int = 100) -> Sequence[T]:
        consulta = select(self.model).offset(skip).limit(limit)
        return self.session.exec(consulta).all()

    def add(self, entidad: T) -> T:
        #flush para obtener el id sin hacer commit
        self.session.add(entidad)
        self.session.flush()
        return entidad

    def delete(self, entidad: T) -> None:
        self.session.delete(entidad)
        self.session.flush()
