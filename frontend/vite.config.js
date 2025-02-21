import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // This tells Vite to listen on all network interfaces
    port: 5173, // Optional: you can change the port here if you prefer
  },
});
