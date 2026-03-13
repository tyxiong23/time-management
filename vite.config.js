import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dataPlugin from "./vite-plugin-data.js";

export default defineConfig({
  plugins: [react(), dataPlugin()],
});
