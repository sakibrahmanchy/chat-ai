import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

// Load environment variables
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create a new pool instance
const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : undefined,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Export the drizzle instance
export const db = drizzle(pool);

// Export the pool for direct queries if needed
export { pool }; 