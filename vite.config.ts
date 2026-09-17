import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import screenFlowEdges from './vite-plugins/screenFlowEdges.ts'
import claudeChanges from './vite-plugins/claudeChanges.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), screenFlowEdges(), claudeChanges()],
  resolve: {
    alias: {
      '@images': path.resolve(__dirname, 'images'),
    },
  },
  server: {
    host: '127.0.0.1',
  },
})
