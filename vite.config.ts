import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        // Keep the vendor runtime out of the app chunk so content edits
        // don't invalidate React + Framer Motion for returning visitors.
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("framer-motion")) return "motion";
            if (id.includes("react")) return "react";
            return "vendor";
          }
        },
      },
    },
  },
});
