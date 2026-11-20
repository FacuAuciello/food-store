#servicio de usuarios: listado y activacion o desactivacion por el admin
from typing import Optional

from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioNoEncontrado(Exception):
    pass


class UsuarioDuplicado(Exception):
    pass


class DesactivacionPropia(Exception):
    pass


class UsuarioService:
    def __init__(self, uow: Optional[UsuarioUnitOfWork] = None) -> None:
        self.uow = uow or UsuarioUnitOfWork()

    def listar(self) -> list[UserPublic]:
        with self.uow as uow:
            usuarios = uow.usuarios.list_all()
            return [UserPublic.model_validate(u) for u in usuarios]

    def activar(self, usuario_id: int) -> UserPublic:
        #idempotente: responde igual aunque ya estuviera activo
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)
            if usuario is None:
                raise UsuarioNoEncontrado()
            usuario.disabled = False
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)

    def desactivar(self, usuario_id: int, admin_id: Optional[int]) -> UserPublic:
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)
            if usuario is None:
                raise UsuarioNoEncontrado()
            if usuario.id == admin_id:
                raise DesactivacionPropia()
            usuario.disabled = True
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)
