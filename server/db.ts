import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// For development, provide a fallback DATABASE_URL
const databaseUrl = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/realtyflow';

if (!process.env.DATABASE_URL && process.env.NODE_ENV === 'development') {
  console.warn('⚠️ Using fallback DATABASE_URL for development. Database operations may fail.');
}

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle({ client: pool, schema });