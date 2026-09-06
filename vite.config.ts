import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// The club API lives on a separate host. Both dev and production talk to it through the
// SAME-ORIGIN "/api" prefix — dev via the proxy below, production via the rewrite in
// vercel.json. That matters: the backend issues an httpOnly `SameSite=Lax` session cookie
// with no Domain attribute and its CORS policy is `Allow-Origin: *` without
// `Allow-Credentials`, so a direct cross-origin call from the browser could never keep a
// session. Proxying keeps the cookie first-party.
const API_TARGET =
  process.env.VITE_API_TARGET ?? "https://stripe-stack-hub.preview.emergentagent.com";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: API_TARGET,
        changeOrigin: true,
        secure: true,
        // Cloudflare in front of the backend rejects non-browser user agents with 1010.
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
        },
        // Strip Domain so the session cookie is scoped to localhost.
        cookieDomainRewrite: "",
        configure: (proxy) => {
          // The cookie is issued with `Secure`, which http://localhost would discard.
          proxy.on("proxyRes", (proxyRes) => {
            const setCookie = proxyRes.headers["set-cookie"];
            if (Array.isArray(setCookie)) {
              proxyRes.headers["set-cookie"] = setCookie.map((c) =>
                c.replace(/;\s*Secure/gi, "").replace(/;\s*SameSite=None/gi, "; SameSite=Lax"),
              );
            }
          });
        },
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
