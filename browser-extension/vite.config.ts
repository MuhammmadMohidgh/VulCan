import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync } from 'fs';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-manifest',
      writeBundle() {
        // Ensure dist exists
        const distDir = resolve(__dirname, 'dist');
        if (!existsSync(distDir)) {
          mkdirSync(distDir, { recursive: true });
        }
        // Copy manifest.json to dist root
        copyFileSync(
          resolve(__dirname, 'public/manifest.json'),
          resolve(distDir, 'manifest.json')
        );
        // Copy icons directory contents
        const iconsDir = resolve(distDir, 'icons');
        if (!existsSync(iconsDir)) {
          mkdirSync(iconsDir, { recursive: true });
        }
        const iconFiles = ['icon16.png', 'icon48.png', 'icon128.png'];
        iconFiles.forEach(icon => {
          const srcPath = resolve(__dirname, `public/icons/${icon}`);
          if (existsSync(srcPath)) {
            copyFileSync(srcPath, resolve(iconsDir, icon));
          }
        });
        // Promote built popup HTML (Vite places it under dist/src/popup/index.html in this multi-entry setup)
        const builtPopupPath = resolve(distDir, 'src/popup/index.html');
        const targetPopupPath = resolve(distDir, 'popup.html');
        if (existsSync(builtPopupPath)) {
          copyFileSync(builtPopupPath, targetPopupPath);
        }
      },
    },
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/index.html'),
        background: resolve(__dirname, 'src/background/background.ts'),
        content: resolve(__dirname, 'src/content/content.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'background' || chunkInfo.name === 'content') {
            return '[name].js';
          }
          return 'assets/[name].js';
        },
        chunkFileNames: 'chunks/[name].js',
        assetFileNames: (assetInfo) => {
          // Let other assets be bundled normally; popup html promotion handled in plugin above.
          return 'assets/[name].[ext]';
        },
      },
    },
  },
  define: {
    'process.env': {},
  },
});
