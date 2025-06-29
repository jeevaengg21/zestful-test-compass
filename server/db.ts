import { Pool } from 'pg'; // Use standard PostgreSQL client
import { drizzle } from 'drizzle-orm/node-postgres'; // Use node-postgres driver instead of neon-serverless
import * as schema from "@shared/schema";
import * as dotenv from "dotenv";

dotenv.config()

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema }); // Note the different format for drizzle initialization

// Test database connection
export async function testDatabaseConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Run test immediately when this file is imported
testDatabaseConnection();
