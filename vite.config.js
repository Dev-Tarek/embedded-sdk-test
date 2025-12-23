import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  build: {
    outDir: "dist",
  },
  // No externals or copying needed - let Vite bundle everything
});
