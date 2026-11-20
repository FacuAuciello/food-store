//#punto de entrada: monta react con el proveedor de tanstack query
import { QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { queryClient } from './shared/api/queryClient'

const raiz = document.getElementById('root')
if (raiz === null) {
  throw new Error('No se encontro el elemento root')
}

createRoot(raiz).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
