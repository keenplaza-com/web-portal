import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { applyStoredColorMode } from '@keenvector/kvcl'
// kvcl first: its bundle is a full Tailwind build, so importing it after this app's
// stylesheet would let its utilities win every tie and break our responsive variants.
import '@keenvector/kvcl/styles.css'
import './index.css'
import { App } from './App'

applyStoredColorMode()

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
)
