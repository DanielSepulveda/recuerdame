import posthog from "posthog-js";
import { env } from "./env";

if (env.NEXT_PUBLIC_POSTHOG_KEY) {
  posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
    // api_host: env.NEXT_PUBLIC_POSTHOG_HOST,
    api_host: "/relay-An6A",
    ui_host: "https://us.posthog.com",
    defaults: "2025-05-24",
  });
}
