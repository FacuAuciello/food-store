#router de auth: register, token (login), logout y me; el jwt viaja en una cookie httponly
from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import settings
from app.core.deps import COOKIE_NAME, get_current_active_user
from app.modules.auth.schemas import MensajeRespuesta
from app.modules.auth.service import (
    AuthService,
    CredencialesIncorrectas,
    CuentaDesactivada,
)
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.service import UsuarioDuplicado

router = APIRouter(prefix="/auth", tags=["Auth"])


def get_auth_service() -> AuthService:
    return AuthService()


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def register(
    datos: UserCreate, service: AuthService = Depends(get_auth_service)
) -> UserPublic:
    try:
        return service.registrar(datos)
    except UsuarioDuplicado:
        raise HTTPException(
            status.HTTP_409_CONFLICT, "El username o el email ya estan registrados"
        )


@router.post("/token", response_model=MensajeRespuesta)
def login(
    response: Response,
    form: OAuth2PasswordRequestForm = Depends(),
    service: AuthService = Depends(get_auth_service),
) -> MensajeRespuesta:
    try:
        token = service.login(form.username, form.password)
    except CredencialesIncorrectas:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Credenciales incorrectas")
    except CuentaDesactivada:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Cuenta de usuario desactivada")
    #el token va solo en la cookie httponly, nunca en el cuerpo
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )
    return MensajeRespuesta(message="Login exitoso")


@router.post("/logout", response_model=MensajeRespuesta)
def logout(response: Response) -> MensajeRespuesta:
    response.delete_cookie(key=COOKIE_NAME, path="/")
    return MensajeRespuesta(message="Sesion cerrada")


@router.get("/me", response_model=UserPublic)
def me(current_user: Usuario = Depends(get_current_active_user)) -> UserPublic:
    return UserPublic.model_validate(current_user)
