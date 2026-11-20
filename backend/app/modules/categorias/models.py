#modelo de tabla categoria con su relacion uno a muchos hacia producto
from typing import TYPE_CHECKING, List, Optional

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.productos.models import Producto


class Categoria(SQLModel, table=True):
    __tablename__ = "categoria"

    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(unique=True, index=True)
    descripcion: Optional[str] = Field(default=None)
    activo: bool = Field(default=True)

    productos: List["Producto"] = Relationship(back_populates="categoria")
