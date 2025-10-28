import { defineConfig } from "vite";
import { resolve } from "path";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "GanakaSDK",
      // Generate multiple formats
      formats: ["es", "cjs"],
      fileName: (format) => {
        if (format === "es") return "index.mjs";
        if (format === "cjs") return "index.js";
        return `index.${format}.js`;
      },
    },
    rollupOptions: {
      // Make sure to externalize dependencies that shouldn't be bundled
      external: [],
      output: {
        // Use named exports to avoid the warning
        exports: "named",
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {},
      },
    },
    // Generate sourcemaps
    sourcemap: true,
    // Don't minify the library
    minify: false,
    // Clean the output directory before building
    emptyOutDir: true,
    // Output directory
    outDir: "dist",
  },
  plugins: [
    // Generate TypeScript declaration files
    dts({
      insertTypesEntry: true,
      rollupTypes: true,
      copyDtsFiles: true,
    }),
  ],
});
