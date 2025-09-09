import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const VITE_PROXY_TARGET = 'https://yzkerun.cn';

export default defineConfig(() => ({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: VITE_PROXY_TARGET,
        changeOrigin: true,
      },
    }
  },
}));
