// =============================================================================
// Global Prisma Client Instance (Prisma v7)
// =============================================================================
// Prisma v7 requires explicit driver adapters for database connections.
// This file provides a singleton pattern to prevent connection pool exhaustion
// during development hot-reloading.
// =============================================================================

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

// Connection pool configuration
const connectionString = process.env.DATABASE_URL;

// Create PostgreSQL connection pool
const pool = new pg.Pool({
  connectionString,
  // Sensible defaults for serverless/development
  max: process.env.NODE_ENV === "production" ? 10 : 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Create Prisma adapter with the pg pool
const adapter = new PrismaPg(pool);

// Singleton pattern to prevent multiple instances during hot-reload
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Export singleton Prisma client
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

// Cache the instance in development to prevent connection pool exhaustion
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Export pool for cleanup in serverless environments if needed
export { pool };

// Utility function for graceful shutdown
export async function disconnectPrisma() {
  await prisma.$disconnect();
  await pool.end();
}
