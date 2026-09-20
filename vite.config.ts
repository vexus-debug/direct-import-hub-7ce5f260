import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";
import {
  devServerBridgePlugin,
  errorCollectorPlugin,
} from "@lovable.dev/vite-plugin-dev-server-bridge";
import { hmrGatePlugin } from "@lovable.dev/vite-plugin-hmr-gate";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    allowedHosts: true,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    hmrGatePlugin(),
    devServerBridgePlugin(),
    errorCollectorPlugin(),
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      strategies: "generateSW",
      registerType: "autoUpdate",
      injectRegister: null,
      filename: "sw.js",
      devOptions: { enabled: false },
      manifest: false,
      includeAssets: ["favicon.png", "pwa-icon-192.png", "pwa-icon-512.png", "apple-touch-icon.png"],
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: false,
        navigateFallback: "/index.html",
        // Public-facing pages (marketing site, clinic sites, results) and OAuth
        // must never be served from the SW cache — the PWA is dashboard-only
        navigateFallbackDenylist: [
          /^\/$/,
          /^\/(features|industries|about|contact|privacy|terms|demo|result)$/,
          /^\/site\//,
          /^\/~oauth/,
        ],
        runtimeCaching: [
          {
            urlPattern: ({ request, url, sameOrigin }) => {
              const p = url.pathname;
              const isPublic =
                p === "/" ||
                /^\/(features|industries|about|contact|privacy|terms|demo|result)$/.test(p) ||
                p.startsWith("/site/");
              return (
                request.mode === "navigate" &&
                sameOrigin &&
                !isPublic &&
                !p.startsWith("/~oauth")
              );
            },
            handler: "NetworkFirst",
            options: {
              cacheName: "clinexus-pages",
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
          {
            urlPattern: ({ url, sameOrigin }) =>
              sameOrigin && /\/assets\/.*\.[0-9a-f]{8,}\.(js|css|woff2?|png|svg|jpg|webp)$/i.test(url.pathname),
            handler: "CacheFirst",
            options: {
              cacheName: "clinexus-assets",
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
