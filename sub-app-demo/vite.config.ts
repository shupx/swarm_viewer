import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import qiankun from 'vite-plugin-qiankun';

export default defineConfig({
  server: {
    port: 5174,
    cors: true,
    origin: 'http://localhost:5174',
  },
  plugins: [
    react(),
    qiankun('sub-app-demo', {
      useDevMode: true,
    }),
  ],
});
