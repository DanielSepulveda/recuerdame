import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    CONVEX_DEPLOYMENT: z.string().min(1),
    CLERK_JWT_ISSUER_DOMAIN: z.string().min(1),
    CLERK_SECRET_KEY: z.string().min(1),
  },

  client: {
    NEXT_PUBLIC_CONVEX_URL: z.string().min(1),
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
    NEXT_PUBLIC_ROOT_DOMAIN: z.string().min(1),
  },

  /**
   * What object holds the environment variables at runtime. This is usually
   * `process.env` or `import.meta.env`.
   */
  runtimeEnv: {
    CONVEX_DEPLOYMENT: process.env.CONVEX_DEPLOYMENT,
    CLERK_JWT_ISSUER_DOMAIN: process.env.CLERK_JWT_ISSUER_DOMAIN,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,

    NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_ROOT_DOMAIN: process.env.NEXT_PUBLIC_ROOT_DOMAIN,
  },

  /**
   * By default, this library will feed the environment variables directly to
   * the Zod validator.
   *
   * This means that if you have an empty string for a value that is supposed
   * to be a number (e.g. `PORT=` in a ".env" file), Zod will incorrectly flag
   * it as a type mismatch violation. Additionally, if you have an empty string
   * for a value that is supposed to be a string with a default value (e.g.
   * `DOMAIN=` in an ".env" file), the default value will never be applied.
   *
   * In order to solve these issues, we recommend that all new projects
   * explicitly specify this option as true.
   */
  emptyStringAsUndefined: true,
});
