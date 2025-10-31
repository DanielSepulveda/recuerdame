import { withPostHogConfig } from "@posthog/nextjs-config";
import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url);

// Import env files to validate at build time. Use jiti so we can load .ts files in here.
await jiti.import("./src/env");

/** @type {import("next").NextConfig} */
let config = {
  typescript: { ignoreBuildErrors: true },

  async rewrites() {
    return [
      // Postho
      {
        source: "/relay-An6A/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/relay-An6A/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    ];
  },
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
};

// export default config;

if (process.env.POSTHOG_API_KEY) {
  config = withPostHogConfig(config, {
    personalApiKey: process.env.POSTHOG_API_KEY,
    envId: process.env.POSTHOG_ENV_ID,
    sourcemaps: {
      enabled: true,
      project: "recuerdame.app",
      deleteAfterUpload: true,
    },
  });
}

export default config;
