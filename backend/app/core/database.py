#base de datos: engine, creacion de tablas y fabrica de sesiones
from importlib import import_module

from sqlalchemy.engine import Engine
from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings


def _crear_engine() -> Engine:
    if settings.DATABASE_URL.startswith("sqlite"):
        #sqlite necesita esta opcion para usarse desde varios hilos
        return create_engine(
            settings.DATABASE_URL, connect_args={"check_same_thread": False}
        )
    return create_engine(settings.DATABASE_URL, pool_pre_ping=True)


engine = _crear_engine()

MODULOS_CON_MODELOS = (
    "app.modules.categorias.models",
    "app.modules.pedidos.models",
    "app.modules.productos.models",
    "app.modules.usuarios.models",
)


def create_all_tables() -> None:
    #se importan los modelos para que queden registrados en el metadata
    for modulo in MODULOS_CON_MODELOS:
        import_module(modulo)

    SQLModel.metadata.create_all(engine)


def session_factory() -> Session:
    #expire_on_commit en false para poder usar los objetos despues del commit
    return Session(engine, expire_on_commit=False)
