import { defineConfig, Plugin } from "vite";
import { resolve } from "path";
import dts from "vite-plugin-dts";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { build as esbuild } from "esbuild";

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
      // Externalize dependencies that should not be bundled
      external: ["dotenv", "path", "worker_threads", "url", "module", "fs"],
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
    // Custom plugin to build worker file
    {
      name: "build-worker",
      async writeBundle() {
        const workerEntry = resolve(__dirname, "src/scheduler/worker.ts");
        const distDir = resolve(__dirname, "dist/scheduler");

        // Build ES module version
        await esbuild({
          entryPoints: [workerEntry],
          bundle: true,
          platform: "node",
          format: "esm",
          outfile: resolve(distDir, "worker.mjs"),
          sourcemap: true,
          external: ["worker_threads"],
        });

        // Build CJS version
        await esbuild({
          entryPoints: [workerEntry],
          bundle: true,
          platform: "node",
          format: "cjs",
          outfile: resolve(distDir, "worker.js"),
          sourcemap: true,
          external: ["worker_threads"],
        });
      },
    } as Plugin,
  ],
});
