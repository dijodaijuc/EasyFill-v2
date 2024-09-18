import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    assetsDir: ".",
    rollupOptions: {
      input: {
        index: "./index.html",
        background: "./src/background/index.ts",
        content: "./src/content/index.ts",
      },
      output: {
        entryFileNames: `[name].js`,
      },
    },
  },
});
