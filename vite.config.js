import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/SP-14-Green-Chess-AI/", // MUST match repo name
});
