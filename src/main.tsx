import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { applyStoredColorMode } from '@keenvector/kvcl'
import './index.css'
import '@keenvector/kvcl/styles.css'
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
