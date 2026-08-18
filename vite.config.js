import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  server: {
    port: 5173,
    strictPort: true
  },
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"]
      },
      includeAssets: ["favicon.ico", "apple-touch-icon.png"],
      manifest: {
        name: "Interactive Web Quiz",
        short_name: "WebQuiz",
        description: "Enterprise-grade interactive quiz platform",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        icons: [
          {
            src: "favicon.ico",
            sizes: "64x64 32x32 24x24 16x16",
            type: "image/x-icon"
          }
        ]
      }
    })
  ],
  test: {
    globals: true,
    environment: "node",
    reporters: process.env.CI ? ["default", "github-actions"] : ["default"],
    include: ["tests/unit/**/*.test.js", "tests/integration/**/*.test.js"],
    exclude: ["tests/e2e/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "json-summary"],
      thresholds: {
        statements: 85,
        branches: 85,
        functions: 85,
        lines: 85
      }
    }
  }
});
