//#declaracion de tipos de las variables de entorno del frontend (los tipos de vite vienen de tsconfig.app.json)
interface ImportMetaEnv {
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
