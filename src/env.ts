import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    ADMIN_USERNAME: z.string(),
    ADMIN_PASSWORD: z.string(),
    DATABASE_URL: z.string(),
    BETTER_AUTH_SECRET: z.string(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
