#router de productos: lecturas publicas con filtros y escrituras solo para admin
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status

from app.core.deps import require_role
from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.service import ProductoNoEncontrado, ProductoService
from app.modules.usuarios.models import Usuario

router = APIRouter(prefix="/productos", tags=["Productos"])


def get_producto_service() -> ProductoService:
    return ProductoService()


@router.get("", response_model=ProductosPaginados)
def listar_productos(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    categoria_id: Optional[int] = Query(None),
    disponible: Optional[bool] = Query(None),
    service: ProductoService = Depends(get_producto_service),
) -> ProductosPaginados:
    return service.listar(
        skip=skip,
        limit=limit,
        search=search,
        categoria_id=categoria_id,
        disponible=disponible,
    )


@router.get("/{producto_id}", response_model=ProductoRead)
def obtener_producto(
    producto_id: int, service: ProductoService = Depends(get_producto_service)
) -> ProductoRead:
    try:
        return service.obtener(producto_id)
    except ProductoNoEncontrado:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Producto no encontrado")


@router.post("", response_model=ProductoRead, status_code=status.HTTP_201_CREATED)
def crear_producto(
    datos: ProductoCreate,
    _admin: Usuario = Depends(require_role(["admin"])),
    service: ProductoService = Depends(get_producto_service),
) -> ProductoRead:
    try:
        return service.crear(datos)
    except CategoriaNoEncontrada:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Categoria no encontrada")


@router.put("/{producto_id}", response_model=ProductoRead)
def actualizar_producto(
    producto_id: int,
    datos: ProductoUpdate,
    _admin: Usuario = Depends(require_role(["admin"])),
    service: ProductoService = Depends(get_producto_service),
) -> ProductoRead:
    try:
        return service.actualizar(producto_id, datos)
    except ProductoNoEncontrado:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Producto no encontrado")
    except CategoriaNoEncontrada:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Categoria no encontrada")


@router.patch("/{producto_id}/stock", response_model=ProductoRead)
def actualizar_stock(
    producto_id: int,
    datos: ProductoStockUpdate,
    _admin: Usuario = Depends(require_role(["admin"])),
    service: ProductoService = Depends(get_producto_service),
) -> ProductoRead:
    try:
        return service.actualizar_stock(producto_id, datos)
    except ProductoNoEncontrado:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Producto no encontrado")


@router.delete("/{producto_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_producto(
    producto_id: int,
    _admin: Usuario = Depends(require_role(["admin"])),
    service: ProductoService = Depends(get_producto_service),
) -> Response:
    try:
        service.eliminar(producto_id)
    except ProductoNoEncontrado:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Producto no encontrado")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
