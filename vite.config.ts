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
        founding: resolve(__dirname, 'post/founding.html'),
        shutdown: resolve(__dirname, 'post/shutdown.html'),
        howold: resolve(__dirname, 'post/how-old.html'),
        favesentence: resolve(__dirname, 'post/favorite-sentence.html'),
        moonphoto: resolve(__dirname, 'post/moon-photo.html'),
        news: resolve(__dirname, 'external/news.html'),
        editlog: resolve(__dirname, 'edit-log/cellar.html'),
        blindzone: resolve(__dirname, 'board/blindzone.html'),
        exploration: resolve(__dirname, 'post/exploration.html'),
        cellar: resolve(__dirname, 'post/cellar.html'),
        beaconholder: resolve(__dirname, 'user/beacon_holder.html'),
        gambit: resolve(__dirname, 'user/gambit.html'),
        vega: resolve(__dirname, 'user/vega.html'),
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
