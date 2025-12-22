import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: ".",
  build: {
    outDir: "dist",
  },
  optimizeDeps: {
    include: ['@salla.sa/embedded-sdk']
  },
  resolve: {
    alias: {
      '@salla.sa/embedded-sdk': resolve('./node_modules/@salla.sa/embedded-sdk/dist/esm/index.js')
    }
  }
});
