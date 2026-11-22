import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Evita depender de @types/node só para ler uma variável de ambiente.
declare const process: { env: Record<string, string | undefined> };

export default defineConfig({
  // No GitHub Pages o site fica em /<repo>/; o workflow de deploy define VITE_BASE.
  base: process.env.VITE_BASE ?? '/',
  plugins: [react()],
  preview: {
    port: 4173,
    strictPort: true,
  },
});
