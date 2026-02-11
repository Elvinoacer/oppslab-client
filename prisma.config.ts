// =============================================================================
// Prisma 7 Configuration
// This file is the central authority for Prisma CLI operations
// =============================================================================
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  // Schema location
  schema: "prisma/schema.prisma",

  // Migration configuration
  migrations: {
    path: "prisma/migrations",
    // Seed command - uses tsx for TypeScript execution
    seed: "npx tsx prisma/seed.ts",
  },

  // Datasource configuration
  // In Prisma 7, environment variables are not auto-loaded
  // They must be explicitly loaded via dotenv/config import above
  datasource: {
    url: env("DATABASE_URL"),
    // For migrations, use DIRECT_URL if using Prisma Accelerate
    // directUrl: env("DIRECT_DATABASE_URL"),
  },
});
