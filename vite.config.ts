import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  base: "./",
  build: {
    target: "esnext",
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        clock: resolve(__dirname, "clock/index.html")
      },
    }
  },
  server: {
    host: '::',
    port: 8080,
    strictPort: true
  },
  preview: {
    open: true,
    host: '::',
    port: 8080,
    strictPort: true
  },
});

