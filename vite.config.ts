// Reference: https://miyauchi.dev/posts/vite-preact-typescript/

import fs from "fs";
import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// values acted on: [glitch | lib]
const DEPLOY_TARGET: string | undefined = process.env.DEPLOY_TARGET;
const HOST: string = process.env.HOST || "metaframe1.localhost";
const PORT: string = process.env.PORT || "4440";
const CERT_FILE: string | undefined = process.env.CERT_FILE;
const CERT_KEY_FILE: string | undefined = process.env.CERT_KEY_FILE;
const BASE: string | undefined = process.env.BASE;
const OUTDIR: string | undefined = process.env.OUTDIR;
const INSIDE_CONTAINER: boolean = fs.existsSync("/.dockerenv");

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => ({
  // For serving NOT at the base path e.g. with github pages: https://<user_or_org>.github.io/<repo>/
  base: BASE,
  resolve: {
    alias: {
      "/@": resolve(__dirname, "./src"),
    },
  },
  // this is really stupid this should not be necessary
  plugins: [react()],
  build: {
    outDir: DEPLOY_TARGET === "lib" ? "dist" : OUTDIR,
    target: "esnext",
    sourcemap: true,
    minify: mode === "development" ? false : "esbuild",
    emptyOutDir: DEPLOY_TARGET === "glitch",
  },
  esbuild: {
    // https://github.com/vitejs/vite/issues/8644
    logOverride: { "this-is-undefined-in-esm": "silent" },
  },
  server: {
    open: false,
    host: INSIDE_CONTAINER ? "0.0.0.0" : HOST,
    port: parseInt(
      CERT_KEY_FILE && fs.existsSync(CERT_KEY_FILE) ? PORT : "8000"
    ),
    headers: {
      // SharedArrayBuffer (needed for ffmpeg.wasm) is disabled on some browsers due to spectre
      // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Opener-Policy#examples
      // This header is required for the parent, but not for the iframe
      // "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
      // https://developer.mozilla.org/en-US/docs/Web/HTTP/Cross-Origin_Resource_Policy_(CORP)
      "Cross-Origin-Resource-Policy": "cross-origin",
      // metapage embedding allways needs all origins
      "Access-Control-Allow-Origin": "*",
    },
    https:
      CERT_KEY_FILE &&
      fs.existsSync(CERT_KEY_FILE) &&
      CERT_FILE &&
      fs.existsSync(CERT_FILE)
        ? {
            key: fs.readFileSync(CERT_KEY_FILE),
            cert: fs.readFileSync(CERT_FILE),
          }
        : undefined,
  },
}));
