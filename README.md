# Food Store

Trabajo Practico Integrador de Programacion 4.

Es un sistema de pedidos de comida. Los clientes se registran, ven el catalogo, arman el carrito y hacen pedidos. El administrador gestiona categorias, productos, pedidos y usuarios.

## Enlaces

- Repositorio de GitHub: https://github.com/FacuAuciello/food-store
- Video de demostracion: https://youtu.be/-BoyW8pm0kQ
## Estructura

```
README.md
backend/     API hecha con FastAPI y SQLModel
frontend/    aplicacion hecha con React y TypeScript
```

## Requisitos

- Python 3.11 a 3.13
- Node.js 20 o superior
- pnpm
- Base de datos: SQLite (no hay que instalar nada). Tambien funciona con PostgreSQL 15 o superior cambiando `DATABASE_URL`.

## Backend

Desde la carpeta `backend`:

```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

Abrir el archivo `.env` y dejar esta linea para usar SQLite:

```
DATABASE_URL=sqlite:///./foodstore.db
```

Despues cargar los datos iniciales y levantar el servidor:

```bash
python -m app.db.seed
uvicorn app.main:app --reload
```

En Linux o Mac se activa con `source venv/bin/activate` y se copia con `cp .env.example .env`.

El backend queda en http://localhost:8000 y la documentacion en http://localhost:8000/docs

### Variables de entorno del backend

Estan en `backend/.env.example`:

| Variable | Para que sirve |
|---|---|
| `DATABASE_URL` | conexion a la base de datos (SQLite o PostgreSQL) |
| `SECRET_KEY` | clave para firmar el token (minimo 32 caracteres) |
| `ALGORITHM` | algoritmo del token (HS256) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | minutos que dura la sesion |
| `FRONTEND_ORIGIN` | direccion del frontend permitida (CORS) |

Para usar PostgreSQL se crea la base y se pone, por ejemplo, `DATABASE_URL=postgresql://usuario:clave@localhost:5432/foodstore_db`.

### Usuario administrador

El seed crea el siguiente usuario, 4 categorias y 10 productos con sus fotos:

- Usuario: `admin`
- Contrasena: `Admin1234!`

## Frontend

Desde la carpeta `frontend`:

```bash
pnpm install
copy .env.example .env
pnpm build
pnpm dev
```

El frontend queda en http://localhost:5173 (con el backend ya corriendo).

### Variables de entorno del frontend

Estan en `frontend/.env.example`:

| Variable | Para que sirve |
|---|---|
| `VITE_API_URL` | direccion de la API (`http://localhost:8000/api/v1`) |