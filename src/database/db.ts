// 'use server';

import mysql, { PoolOptions } from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";

// Client-side safe DB handling

// Define a minimal type for db for the client-side
export type DbType = any; // Using any to avoid type mismatches with drizzle

// Create a minimal mock db for client-side
const mockDb: DbType = {
  query: async () => [],
  execute: async () => []
};

// Initialize db with a value to prevent "undefined" errors
let db: DbType = mockDb;

// Only initialize the DB on server-side
if (typeof window === 'undefined') {
  try {
    // Database configuration variables
    const host = process.env.DB_HOST || 'localhost';
    const port = parseInt(process.env.DB_PORT || '3306');
    const user = process.env.DB_USER || 'root';
    const password = process.env.DB_PASSWORD || 'password';
    const dbName = process.env.DB_NAME || 'ubuntu-lend-database';
    
    // MySQL connection pool configuration
    const dbConnectionConfig = {
      host, 
      port, 
      user, 
      password,
      database: dbName,
      connectionLimit: 1000, 
      queueLimit: 15000, 
      waitForConnections: true,
    };
    
    // Create connection pool on server-side only
    const connectionPool = mysql.createPool(dbConnectionConfig);
    
    // Initialize drizzle with the MySQL connection
    db = drizzle(connectionPool);
  } catch (error) {
    console.error('Error initializing database:', error);
    db = mockDb;
  }
}

export { db };