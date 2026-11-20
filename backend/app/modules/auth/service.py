#servicio de auth: registro de usuarios y validacion de credenciales para el login
from typing import Optional

from app.core.security import create_access_token, hash_password, verify_password
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.service import UsuarioDuplicado
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class CredencialesIncorrectas(Exception):
    pass


class CuentaDesactivada(Exception):
    pass


class AuthService:
    def __init__(self, uow: Optional[UsuarioUnitOfWork] = None) -> None:
        self.uow = uow or UsuarioUnitOfWork()

    def registrar(self, datos: UserCreate) -> UserPublic:
        #el registro publico siempre crea usuarios con rol user
        with self.uow as uow:
            if uow.usuarios.get_by_username(datos.username) is not None:
                raise UsuarioDuplicado()
            if uow.usuarios.get_by_email(str(datos.email)) is not None:
                raise UsuarioDuplicado()
            usuario = Usuario(
                username=datos.username,
                full_name=datos.full_name,
                email=str(datos.email),
                hashed_password=hash_password(datos.password),
                role="user",
            )
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)

    def login(self, username: str, password: str) -> str:
        #devuelve el jwt; el router lo guarda en la cookie
        with self.uow as uow:
            usuario = uow.usuarios.get_by_username(username)
            if usuario is None or not verify_password(
                password, usuario.hashed_password
            ):
                raise CredencialesIncorrectas()
            if usuario.disabled:
                raise CuentaDesactivada()
            return create_access_token({"sub": usuario.username, "role": usuario.role})
