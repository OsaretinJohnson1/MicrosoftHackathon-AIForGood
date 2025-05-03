import { defineConfig, Config } from 'drizzle-kit';
import { config } from 'dotenv';
config(); 

export default defineConfig({
    dialect: 'mysql', 
    dbCredentials: {
        port: Number(process.env.DB_PORT) || 3306, 
        host: process.env.DB_HOST!,
        user: process.env.DB_USER!,
        password: process.env.DB_PASSWORD!,
        database: process.env.DB_NAME!,
    },
    schema: './src/database/AI-For-Good/schema.ts', 
    out: './src/database/AI-For-Good', 
} as Config);