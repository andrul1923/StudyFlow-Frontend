import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// host: true expone el dev server en todas las interfaces de red (no solo
// localhost), así se puede abrir desde localhost o desde cualquier IP de LAN
// sin tocar esta config. El backend (en dev) acepta cualquier origen por CORS,
// así que no hace falta coordinar puertos/IPs entre ambos.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
  },
})
