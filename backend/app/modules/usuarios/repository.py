#repositorio de usuarios: consultas por username, email y listado
from typing import Optional, Sequence

from sqlmodel import Session, col, select

from app.core.base_repository import BaseRepository
from app.modules.usuarios.models import Usuario


class UsuarioRepository(BaseRepository[Usuario]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Usuario)

    def get_by_username(self, username: str) -> Optional[Usuario]:
        consulta = select(Usuario).where(Usuario.username == username)
        return self.session.exec(consulta).first()

    def get_by_email(self, email: str) -> Optional[Usuario]:
        consulta = select(Usuario).where(Usuario.email == email)
        return self.session.exec(consulta).first()

    def list_all(self) -> Sequence[Usuario]:
        consulta = select(Usuario).order_by(col(Usuario.id))
        return self.session.exec(consulta).all()
