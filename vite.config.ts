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
        blindzoneEntry1: resolve(__dirname, 'blindzone/entry/1.html'),
        blindzoneEntry2: resolve(__dirname, 'blindzone/entry/2.html'),
        missing: resolve(__dirname, 'external/missing.html'),
        zhengzao: resolve(__dirname, 'external/zhengzao.html'),
        zhengzaoRecruit: resolve(__dirname, 'external/zhengzao/recruitment.html'),
        zhengzaoRecruit2013: resolve(__dirname, 'external/zhengzao/recruitment-2013.html'),
        polybius: resolve(__dirname, 'post/polybius.html'),
        polybiusTool: resolve(__dirname, 'external/polybius-tool.html'),
        finalArchive: resolve(__dirname, 'post/final-archive.html'),
        endingDisclose: resolve(__dirname, 'ending/disclose.html'),
        endingSilence: resolve(__dirname, 'ending/silence.html'),
        saintex: resolve(__dirname, 'saint-exupery/index.html'),
        farewell: resolve(__dirname, 'farewell/index.html'),
        scouting: resolve(__dirname, 'post/scouting-2014.html'),
        vegaDrafts: resolve(__dirname, 'user/vega/drafts.html'),
        flightPath: resolve(__dirname, 'flight-path/index.html'),
        statement: resolve(__dirname, 'statement/index.html'),
        memoirXutian: resolve(__dirname, 'memoir/xutian.html'),
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
