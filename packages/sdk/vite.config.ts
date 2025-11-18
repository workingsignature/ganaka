import { defineConfig } from "vite";
import { resolve } from "path";
import dts from "vite-plugin-dts";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default defineConfig({
  resolve: {
    // Don't preserve symlinks to ensure we resolve to actual files
    preserveSymlinks: false,
  },
  build: {
    target: "node18",
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
      plugins: [
        nodeResolve({
          preferBuiltins: true, // Prefer Node.js built-ins
          exportConditions: ["node", "default"],
        }),
        commonjs(),
      ],
      // Externalize dotenv - it will be a peer dependency
      external: ["dotenv"],
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
