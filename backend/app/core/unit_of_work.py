#unit of work base: abre la sesion al entrar y hace commit, rollback y close al salir
from typing import Callable, Optional

from sqlmodel import Session

from app.core.database import session_factory


class UnitOfWork:
    def __init__(self, factory: Callable[[], Session] = session_factory) -> None:
        self._factory = factory
        self.session: Optional[Session] = None

    def crear_repositorios(self, session: Session) -> None:
        #las subclases crean aca los repositorios que comparten la sesion
        return None

    def __enter__(self) -> "UnitOfWork":
        self.session = self._factory()
        self.crear_repositorios(self.session)
        return self

    def __exit__(self, exc_type, exc_value, traceback) -> bool:
        if self.session is None:
            return False
        try:
            if exc_type is None:
                self.session.commit()
            else:
                self.session.rollback()
        finally:
            self.session.close()
        #no se traga la excepcion: sigue hacia el router
        return False
