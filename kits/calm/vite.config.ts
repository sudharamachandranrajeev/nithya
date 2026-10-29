import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'

// The demo page under demo/ shows every theme and part; the kit itself is src/.
export default defineConfig({
  root: 'demo',
  plugins: [svelte()],
  clearScreen: false,
  server: { port: 5175, strictPort: true },
  build: { outDir: '../dist', emptyOutDir: true },
})
