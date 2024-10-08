import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import path from 'path'


export default defineConfig({
  define: {
    global: "window",
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [react(), viteTsconfigPaths()],
  server: {
    open: true,
    host: true,
  },
  preview: {
    open: false,
  },
});
