#router de usuarios: endpoints de administracion bajo /admin/usuarios (solo admin)
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import require_role
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import (
    DesactivacionPropia,
    UsuarioNoEncontrado,
    UsuarioService,
)

router = APIRouter(prefix="/admin/usuarios", tags=["Usuarios (admin)"])


def get_usuario_service() -> UsuarioService:
    return UsuarioService()


@router.get("", response_model=list[UserPublic])
def listar_usuarios(
    _admin: Usuario = Depends(require_role(["admin"])),
    service: UsuarioService = Depends(get_usuario_service),
) -> list[UserPublic]:
    return service.listar()


@router.post("/{usuario_id}/activar", response_model=UserPublic)
def activar_usuario(
    usuario_id: int,
    _admin: Usuario = Depends(require_role(["admin"])),
    service: UsuarioService = Depends(get_usuario_service),
) -> UserPublic:
    try:
        return service.activar(usuario_id)
    except UsuarioNoEncontrado:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Usuario no encontrado")


@router.post("/{usuario_id}/desactivar", response_model=UserPublic)
def desactivar_usuario(
    usuario_id: int,
    admin: Usuario = Depends(require_role(["admin"])),
    service: UsuarioService = Depends(get_usuario_service),
) -> UserPublic:
    try:
        return service.desactivar(usuario_id, admin.id)
    except UsuarioNoEncontrado:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Usuario no encontrado")
    except DesactivacionPropia:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, "El admin no puede desactivarse a si mismo"
        )
