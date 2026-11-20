#seed idempotente: crea el usuario admin, las categorias y los productos de ejemplo
from sqlmodel import select

from app.core.database import create_all_tables, session_factory
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario

ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "Admin1234!"

CATEGORIAS = [
    ("Hamburguesas", "Hamburguesas armadas al momento"),
    ("Pizzas", "Pizzas a la piedra"),
    ("Bebidas", "Gaseosas, aguas y cervezas"),
    ("Postres", "Dulces para cerrar la comida"),
]

#nombre, descripcion, precio, stock, categoria
PRODUCTOS = [
    ("Hamburguesa Clasica", "Carne, queso, lechuga y tomate", 13000.0, 30, "Hamburguesas"),
    ("Hamburguesa Doble", "Doble carne con cheddar y panceta", 16000.0, 25, "Hamburguesas"),
    ("Pizza Muzzarella", "Salsa de tomate y muzzarella", 20000.0, 20, "Pizzas"),
    ("Pizza Napolitana", "Muzzarella, tomate fresco y ajo", 23000.0, 20, "Pizzas"),
    ("Pizza Fugazzeta", "Cebolla y abundante queso", 27000.0, 15, "Pizzas"),
    ("Coca-Cola 500ml", "Gaseosa cola bien fria", 5000.0, 60, "Bebidas"),
    ("Agua Mineral 500ml", "Agua sin gas", 2500.0, 60, "Bebidas"),
    ("Cerveza Artesanal", "Rubia de elaboracion local", 5000.0, 40, "Bebidas"),
    ("Flan con Dulce de Leche", "Flan casero con crema", 5000.0, 18, "Postres"),
    ("Brownie con Helado", "Brownie tibio y bola de crema", 7500.0, 12, "Postres"),
]


#las fotos viven en frontend/public/productos y las sirve el frontend
IMAGENES = {
    "Hamburguesa Clasica": "/productos/hamburguesa-clasica.jpg",
    "Hamburguesa Doble": "/productos/hamburguesa-doble.jpg",
    "Pizza Muzzarella": "/productos/pizza-muzzarella.jpg",
    "Pizza Napolitana": "/productos/pizza-napolitana.jpg",
    "Pizza Fugazzeta": "/productos/pizza-fugazzeta.jpg",
    "Coca-Cola 500ml": "/productos/coca-cola-500ml.jpg",
    "Agua Mineral 500ml": "/productos/agua-mineral-500ml.jpg",
    "Cerveza Artesanal": "/productos/cerveza-artesanal.jpg",
    "Flan con Dulce de Leche": "/productos/flan-con-dulce-de-leche.jpg",
    "Brownie con Helado": "/productos/brownie-con-helado.jpg",
}


def run_seed() -> None:
    create_all_tables()
    with session_factory() as session:
        admin = session.exec(
            select(Usuario).where(Usuario.username == ADMIN_USERNAME)
        ).first()
        if admin is None:
            session.add(
                Usuario(
                    username=ADMIN_USERNAME,
                    full_name="Administrador",
                    email="admin@foodstore.com",
                    hashed_password=hash_password(ADMIN_PASSWORD),
                    role="admin",
                )
            )

        categorias: dict[str, Categoria] = {}
        for nombre, descripcion in CATEGORIAS:
            categoria = session.exec(
                select(Categoria).where(Categoria.nombre == nombre)
            ).first()
            if categoria is None:
                categoria = Categoria(nombre=nombre, descripcion=descripcion)
                session.add(categoria)
            categorias[nombre] = categoria
        #flush para que las categorias nuevas tengan id
        session.flush()

        for nombre, descripcion, precio, stock, nombre_categoria in PRODUCTOS:
            existente = session.exec(
                select(Producto).where(Producto.nombre == nombre)
            ).first()
            if existente is None:
                session.add(
                    Producto(
                        categoria_id=categorias[nombre_categoria].id,
                        nombre=nombre,
                        descripcion=descripcion,
                        precio_base=precio,
                        imagen_url=IMAGENES[nombre],
                        stock=stock,
                    )
                )
            else:
                #si ya existe se actualiza precio e imagen, el stock no se toca
                existente.precio_base = precio
                existente.imagen_url = IMAGENES[nombre]
                session.add(existente)
        session.commit()
    print("Seed completado: usuario admin, categorias y productos cargados.")


if __name__ == "__main__":
    run_seed()
