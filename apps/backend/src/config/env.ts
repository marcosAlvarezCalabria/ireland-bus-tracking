import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive(),
  NODE_ENV: z.enum(["development", "test", "production"]),
  DATABASE_URL: z.string().url()
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  throw new Error(`Invalid environment variables: ${result.error.message}`);
}

export const env = result.data;
