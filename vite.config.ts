import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // kvcl is linked from ../../kvcl, which has its own node_modules: force one React instance.
  resolve: { dedupe: ['react', 'react-dom'] },
  server: { port: 5175 }
})
