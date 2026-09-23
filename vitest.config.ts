import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  // These tests don't exercise CSS; skip the project's Tailwind v4 PostCSS
  // config (Vite's PostCSS loader can't parse it).
  css: { postcss: { plugins: [] } },
  test: {
    environment: "jsdom",
    // Interceptor reads NEXT_PUBLIC_API_URL at module load, so provide it here.
    env: { NEXT_PUBLIC_API_URL: "http://api.test" },
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
