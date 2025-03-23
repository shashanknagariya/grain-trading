import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'mui-vendor': ['@mui/material', '@mui/icons-material', '@mui/x-date-pickers'],
          'chart-vendor': ['chart.js', 'react-chartjs-2'],
          'utils-vendor': ['date-fns', 'lodash', 'axios']
        }
      }
    },
    chunkSizeWarningLimit: 1600,
    sourcemap: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
}); 