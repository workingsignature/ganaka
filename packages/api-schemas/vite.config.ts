import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      rollupTypes: false,
    }),
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        common: resolve(__dirname, "src/common.ts"),
        strategies: resolve(__dirname, "src/strategies.ts"),
        versions: resolve(__dirname, "src/versions.ts"),
        shortlists: resolve(__dirname, "src/shortlists.ts"),
        keys: resolve(__dirname, "src/keys.ts"),
      },
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: ["zod", "semver"],
      output: {
        exports: "named",
      },
    },
  },
});

