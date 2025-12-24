// packages/db/src/client.ts
import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  var prisma: PrismaClient | undefined;
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Parse connection string and configure SSL for Neon
let connectionString = process.env.DATABASE_URL;
const isNeon = connectionString.includes('neon.tech');

// Remove channel_binding=require as it can cause connection issues
connectionString = connectionString.replace(/[?&]channel_binding=[^&]*/g, '');

// For Neon pooler connections, we need specific SSL config
const poolConfig: any = {
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000,
};

if (isNeon) {
  // Neon requires SSL but with specific settings
  poolConfig.ssl = {
    rejectUnauthorized: false,
  };
}

const pool = new Pool(poolConfig);

// Handle pool errors
pool.on('error', (err: Error) => {
  console.error('Database pool error:', err.message);
});

// Test connection on startup (only in development)
if (process.env.NODE_ENV !== 'production') {
  pool.query('SELECT 1')
    .then(() => {
      console.log('✅ Database connection successful');
    })
    .catch((err: any) => {
      const maskedUrl = connectionString.replace(/:[^:@]+@/, ':****@');
      console.error('❌ Database connection failed');
      console.error('Error code:', err.code || 'N/A');
      console.error('Error message:', err.message || err.toString());
      console.error('Connection string:', maskedUrl);
      
      if (err.code === 'ETIMEDOUT' || err.message?.includes('ETIMEDOUT')) {
        console.error('\n⚠️  Connection timeout detected!');
        console.error('Possible causes:');
        console.error('1. Neon database is PAUSED - Go to https://console.neon.tech and wake it up');
        console.error('2. Network/firewall blocking SSL connections from WSL2');
        console.error('3. Database endpoint is unreachable');
        console.error('\n💡 Try these solutions:');
        console.error('   - Check Neon dashboard: https://console.neon.tech');
        console.error('   - Verify database is ACTIVE (not paused)');
        console.error('   - Try connecting from outside WSL2 to test network');
      } else if (err.code === 'ENOTFOUND') {
        console.error('\n⚠️  DNS resolution failed - hostname not found');
        console.error('Check that the connection string hostname is correct');
      } else if (err.code === 'ECONNREFUSED') {
        console.error('\n⚠️  Connection refused - database may be down or firewall blocking');
      }
    });
}

const adapter = new PrismaPg(pool);

export const prisma =
  globalThis.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}
