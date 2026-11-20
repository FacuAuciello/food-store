#schemas del modulo auth: respuesta simple con mensaje
from sqlmodel import SQLModel


class MensajeRespuesta(SQLModel):
    message: str
