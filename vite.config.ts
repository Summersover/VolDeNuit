import { defineConfig } from 'vite'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        deepspace: resolve(__dirname, 'board/deepspace.html'),
        tower: resolve(__dirname, 'board/tower.html'),
        lounge: resolve(__dirname, 'board/lounge.html'),
        blindzone: resolve(__dirname, 'board/blindzone.html'),
        exploration: resolve(__dirname, 'post/exploration.html'),
        cellar: resolve(__dirname, 'post/cellar.html'),
      },
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash][extname]',
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
