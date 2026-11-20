#dependencias de fastapi: usuario de la cookie, usuario activo y control de rol
from typing import Callable, Sequence

from fastapi import Depends, HTTPException, Request, status

from app.core.security import decode_access_token
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

COOKIE_NAME = "access_token"


def get_current_user(request: Request) -> Usuario:
    #lee el jwt de la cookie httponly; 401 si falta o es invalido
    credenciales_invalidas = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No autenticado",
    )
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        raise credenciales_invalidas
    payload = decode_access_token(token)
    if payload is None or not payload.get("sub"):
        raise credenciales_invalidas
    with UsuarioUnitOfWork() as uow:
        usuario = uow.usuarios.get_by_username(str(payload["sub"]))
    if usuario is None:
        raise credenciales_invalidas
    return usuario


def get_current_active_user(
    current_user: Usuario = Depends(get_current_user),
) -> Usuario:
    #400 si la cuenta esta desactivada
    if current_user.disabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cuenta de usuario desactivada",
        )
    return current_user


def require_role(roles: Sequence[str]) -> Callable[..., Usuario]:
    #devuelve una dependencia que exige uno de los roles indicados
    def verificar_rol(
        current_user: Usuario = Depends(get_current_active_user),
    ) -> Usuario:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene permisos para esta operacion",
            )
        return current_user

    return verificar_rol
