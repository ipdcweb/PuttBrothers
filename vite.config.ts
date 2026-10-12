import { defineConfig } from "vite";
import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  server: {
    watch: {
      // Raw production media is not imported by the app. Windows editors can
      // lock these large files; watch only the served public/videos derivatives.
      ignored: ["**/assets/ScrollingVideo_v01/**"],
    },
  },
  plugins: [
    vinext(),
    cloudflare({
      viteEnvironment: {
        name: "rsc",
        childEnvironments: ["ssr"],
      },
    }),
  ],
});
