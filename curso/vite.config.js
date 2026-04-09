import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // Necesario para manejar rutas

export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      sass: {
        // Agregamos la subcarpeta 'presentation' que faltaba
        additionalData: `@import "@/variables.sass"\n`
      },
    },
  },
  resolve: {
    alias: {
      // Como ya tienes configurado el alias '@', úsalo para ir a la segura
      '@': path.resolve(__dirname, './src'),
    },
  },
})

