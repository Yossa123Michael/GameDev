import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    define: {
    global: 'window',
  },
    build: {
      outDir: '../../dist/client',
      emptyOutDir: true, // tambahkan ini agar Vite boleh mengosongkan folder di luar root
      sourcemap: true,
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          manualChunks: {
            phaser: ['phaser'],
          },
        },
      },
      ...(mode === 'production' && {
        minify: 'terser',
        terserOptions: {
          compress: {
            passes: 2,
          },
          mangle: true,
          format: {
            comments: false,
          },
        },
      }),
    },
    server: {
    port: 3000,
    },
  };
});
