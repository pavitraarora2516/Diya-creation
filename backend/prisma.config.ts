import "dotenv/config";
import { defineConfig, env } from "prisma/config";

if (!process.env.DATABASE_URL) {
  console.warn(
    "[WARN] DATABASE_URL environment variable is not set. " +
    "Prisma will fail to connect. Please set DATABASE_URL to your PostgreSQL connection string."
  );
}

export default defineConfig({
  schema: "./prisma/schema.prisma",
  migrations: {
    path: "./prisma/migrations",
    seed: "ts-node ./prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
