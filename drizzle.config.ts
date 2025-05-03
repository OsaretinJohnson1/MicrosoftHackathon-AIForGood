import { defineConfig, Config } from 'drizzle-kit';
import { config } from 'dotenv';
config(); 

export default defineConfig({
    dialect: 'mysql', 
    dbCredentials: {
        port: process.env.DB_PORT || 3306, 
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'password',
        database: 'ubuntu-lend-database', 
    },
    schema: './src/database/ubuntu-lend/schema.ts', 
    out: './src/database/ubuntu-lend', 
} as Config);