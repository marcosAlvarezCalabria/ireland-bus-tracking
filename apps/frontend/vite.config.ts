import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");

  return {
    plugins: [react()],
    define: {
      __VITE_API_URL__: JSON.stringify(env.VITE_API_URL)
    },
    server: {
      proxy: {
        "/api": "http://localhost:3001"
      }
    },
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: "./src/test-setup.ts"
    }
  };
});
