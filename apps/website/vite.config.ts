import react from "@vitejs/plugin-react";

import { defineConfig } from "vite-plus";

export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      allow: ["../.."], // モノレポルートへのアクセスを許可
    },
  },
});
