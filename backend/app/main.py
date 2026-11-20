#punto de entrada: crea la app fastapi, registra cors con credenciales e incluye los routers en /api/v1
from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import create_all_tables
from app.modules.auth.router import router as auth_router
from app.modules.categorias.router import router as categorias_router
from app.modules.pedidos.router import router as pedidos_router
from app.modules.productos.router import router as productos_router
from app.modules.usuarios.router import router as usuarios_router


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    #al iniciar se crean las tablas si no existen
    create_all_tables()
    yield


app = FastAPI(
    title="Food Store API",
    description="API REST del sistema de pedidos de comida (TPI Programacion 4)",
    version="1.0.0",
    lifespan=lifespan,
)

#cors con credenciales para que el navegador envie la cookie httponly
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth_router)
api_router.include_router(usuarios_router)
api_router.include_router(categorias_router)
api_router.include_router(productos_router)
api_router.include_router(pedidos_router)

app.include_router(api_router)
