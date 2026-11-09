import { defineConfig } from "vite";
import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";

// One source, two explicit targets. Local development always defaults to dev.
const deploymentTarget = process.env.PB_DEPLOY_TARGET ?? "preview";
if (!["preview", "production"].includes(deploymentTarget)) {
  throw new Error("PB_DEPLOY_TARGET must be preview or production");
}

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
      configPath: deploymentTarget === "production" ? "wrangler.jsonc" : "wrangler.preview.jsonc",
      viteEnvironment: {
        name: "rsc",
        childEnvironments: ["ssr"],
      },
    }),
  ],
});
