#servicio de categorias: reglas de negocio y baja logica; devuelve schemas dentro del unit of work
from typing import Optional

from app.modules.categorias.schemas import (
    CategoriaCreate,
    CategoriaRead,
    CategoriaUpdate,
)
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork
from app.modules.categorias.models import Categoria


class CategoriaNoEncontrada(Exception):
    pass


class NombreDuplicado(Exception):
    pass


class CategoriaService:
    def __init__(self, uow: Optional[CategoriaUnitOfWork] = None) -> None:
        self.uow = uow or CategoriaUnitOfWork()

    def listar(self) -> list[CategoriaRead]:
        with self.uow as uow:
            categorias = uow.categorias.list_activas()
            return [CategoriaRead.model_validate(c) for c in categorias]

    def obtener(self, categoria_id: int) -> CategoriaRead:
        with self.uow as uow:
            categoria = uow.categorias.get_by_id(categoria_id)
            #una categoria dada de baja se trata como inexistente
            if categoria is None or not categoria.activo:
                raise CategoriaNoEncontrada()
            return CategoriaRead.model_validate(categoria)

    def crear(self, datos: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            #el nombre es unico aun entre las categorias dadas de baja
            if uow.categorias.get_by_nombre(datos.nombre) is not None:
                raise NombreDuplicado()
            categoria = Categoria(nombre=datos.nombre, descripcion=datos.descripcion)
            uow.categorias.add(categoria)
            return CategoriaRead.model_validate(categoria)

    def actualizar(self, categoria_id: int, datos: CategoriaUpdate) -> CategoriaRead:
        with self.uow as uow:
            categoria = uow.categorias.get_by_id(categoria_id)
            if categoria is None or not categoria.activo:
                raise CategoriaNoEncontrada()
            cambios = datos.model_dump(exclude_unset=True)
            nuevo_nombre = cambios.get("nombre")
            if nuevo_nombre is not None and nuevo_nombre != categoria.nombre:
                existente = uow.categorias.get_by_nombre(nuevo_nombre)
                if existente is not None:
                    raise NombreDuplicado()
            for campo, valor in cambios.items():
                if campo == "nombre" and valor is None:
                    continue
                setattr(categoria, campo, valor)
            uow.categorias.add(categoria)
            return CategoriaRead.model_validate(categoria)

    def eliminar(self, categoria_id: int) -> None:
        #baja logica: no se borra la fila ni se liberan el nombre ni los productos
        with self.uow as uow:
            categoria = uow.categorias.get_by_id(categoria_id)
            if categoria is None or not categoria.activo:
                raise CategoriaNoEncontrada()
            categoria.activo = False
            uow.categorias.add(categoria)
