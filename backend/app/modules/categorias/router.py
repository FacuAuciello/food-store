#router de categorias: lecturas publicas y escrituras solo para admin
from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.core.deps import require_role
from app.modules.categorias.schemas import (
    CategoriaCreate,
    CategoriaRead,
    CategoriaUpdate,
)
from app.modules.categorias.service import (
    CategoriaNoEncontrada,
    CategoriaService,
    NombreDuplicado,
)
from app.modules.usuarios.models import Usuario

router = APIRouter(prefix="/categorias", tags=["Categorias"])


def get_categoria_service() -> CategoriaService:
    return CategoriaService()


@router.get("", response_model=list[CategoriaRead])
def listar_categorias(
    service: CategoriaService = Depends(get_categoria_service),
) -> list[CategoriaRead]:
    return service.listar()


@router.get("/{categoria_id}", response_model=CategoriaRead)
def obtener_categoria(
    categoria_id: int, service: CategoriaService = Depends(get_categoria_service)
) -> CategoriaRead:
    try:
        return service.obtener(categoria_id)
    except CategoriaNoEncontrada:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Categoria no encontrada")


@router.post("", response_model=CategoriaRead, status_code=status.HTTP_201_CREATED)
def crear_categoria(
    datos: CategoriaCreate,
    _admin: Usuario = Depends(require_role(["admin"])),
    service: CategoriaService = Depends(get_categoria_service),
) -> CategoriaRead:
    try:
        return service.crear(datos)
    except NombreDuplicado:
        raise HTTPException(
            status.HTTP_409_CONFLICT, "Ya existe una categoria con ese nombre"
        )


@router.put("/{categoria_id}", response_model=CategoriaRead)
def actualizar_categoria(
    categoria_id: int,
    datos: CategoriaUpdate,
    _admin: Usuario = Depends(require_role(["admin"])),
    service: CategoriaService = Depends(get_categoria_service),
) -> CategoriaRead:
    try:
        return service.actualizar(categoria_id, datos)
    except CategoriaNoEncontrada:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Categoria no encontrada")
    except NombreDuplicado:
        raise HTTPException(
            status.HTTP_409_CONFLICT, "Ya existe una categoria con ese nombre"
        )


@router.delete("/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_categoria(
    categoria_id: int,
    _admin: Usuario = Depends(require_role(["admin"])),
    service: CategoriaService = Depends(get_categoria_service),
) -> Response:
    try:
        service.eliminar(categoria_id)
    except CategoriaNoEncontrada:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Categoria no encontrada")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
