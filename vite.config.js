import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// El backend permite el origen http://localhost:5173 en CORS_ALLOWED_ORIGINS,
// así que fijamos ese puerto para no chocar con la configuración del backend.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
  },
})
