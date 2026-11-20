#servicio de productos: reglas de negocio, stock, baja logica y listado paginado
from typing import Optional

from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.models import Producto
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork

#campos obligatorios: si llegan en null se ignoran
CAMPOS_NO_NULOS = {"categoria_id", "nombre", "precio_base", "stock", "disponible"}


class ProductoNoEncontrado(Exception):
    pass


class ProductoService:
    def __init__(self, uow: Optional[ProductoUnitOfWork] = None) -> None:
        self.uow = uow or ProductoUnitOfWork()

    def listar(
        self,
        skip: int = 0,
        limit: int = 20,
        search: Optional[str] = None,
        categoria_id: Optional[int] = None,
        disponible: Optional[bool] = None,
    ) -> ProductosPaginados:
        with self.uow as uow:
            items, total = uow.productos.search(
                skip=skip,
                limit=limit,
                search=search,
                categoria_id=categoria_id,
                disponible=disponible,
            )
            return ProductosPaginados(
                total=total,
                items=[ProductoRead.model_validate(p) for p in items],
            )

    def obtener(self, producto_id: int) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_by_id(producto_id)
            if producto is None or not producto.activo:
                raise ProductoNoEncontrado()
            return ProductoRead.model_validate(producto)

    def crear(self, datos: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            self._validar_categoria(uow, datos.categoria_id)
            producto = Producto(**datos.model_dump())
            uow.productos.add(producto)
            return ProductoRead.model_validate(producto)

    def actualizar(self, producto_id: int, datos: ProductoUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_by_id(producto_id)
            if producto is None or not producto.activo:
                raise ProductoNoEncontrado()
            cambios = datos.model_dump(exclude_unset=True)
            nueva_categoria = cambios.get("categoria_id")
            if nueva_categoria is not None:
                self._validar_categoria(uow, nueva_categoria)
            for campo, valor in cambios.items():
                if valor is None and campo in CAMPOS_NO_NULOS:
                    continue
                setattr(producto, campo, valor)
            uow.productos.add(producto)
            return ProductoRead.model_validate(producto)

    def actualizar_stock(
        self, producto_id: int, datos: ProductoStockUpdate
    ) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_by_id(producto_id)
            if producto is None or not producto.activo:
                raise ProductoNoEncontrado()
            if datos.stock is not None:
                producto.stock = datos.stock
            if datos.disponible is not None:
                producto.disponible = datos.disponible
            uow.productos.add(producto)
            return ProductoRead.model_validate(producto)

    def eliminar(self, producto_id: int) -> None:
        #baja logica: activo en false
        with self.uow as uow:
            producto = uow.productos.get_by_id(producto_id)
            if producto is None or not producto.activo:
                raise ProductoNoEncontrado()
            producto.activo = False
            uow.productos.add(producto)

    def _validar_categoria(self, uow: ProductoUnitOfWork, categoria_id: int) -> None:
        #la categoria debe existir y estar activa
        categoria = uow.categorias.get_by_id(categoria_id)
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada()
