import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Fonts live once, in the Flutter package; allow the dev server to read them.
export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: { port: 5174, strictPort: true, fs: { allow: ['..'] } },
  envPrefix: ['VITE_', 'TAURI_ENV_'],
  build: { target: 'es2022', outDir: 'dist' },
  test: { environment: 'jsdom', css: false },
});
