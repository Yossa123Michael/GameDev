import { defineConfig } from 'vite';
import { builtinModules } from 'node:module';

export default defineConfig({
  ssr: {
    noExternal: true,
  },
  build: {
    ssr: 'index.ts',
    outDir: '../../dist/server',
    emptyOutDir: true, // tambahkan ini agar Vite boleh mengosongkan folder di luar root
    target: 'node22',
    sourcemap: true,
    rollupOptions: {
      external: [...builtinModules],
      output: {
        format: 'cjs',
        entryFileNames: 'index.cjs',
        inlineDynamicImports: true,
      },
    },
  },
});
