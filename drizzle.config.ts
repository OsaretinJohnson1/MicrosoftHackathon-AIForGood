import { defineConfig, Config } from 'drizzle-kit';
import { config } from 'dotenv';
import { resolve } from 'path';
// config(); 
config({ path: resolve(__dirname, '.env') }); // ✅ Force .env loading

export default defineConfig({
    dialect: 'mysql', 
    dbCredentials: {
        port: 3306, 
        host: "appimate-clients-database-server.mysql.database.azure.com",
        user: "appimateclientsadministrator",
        password: "KTkSLH37tVmbWEJ",
        database: "ai-for-good",
    },
    schema: './src/database/AI-For-Good/schema.ts', 
    out: './src/database/AI-For-Good', 
} as Config);

console.log("DB ENV", process.env.DB_HOST, process.env.DB_USER, process.env.DB_PASSWORD, process.env.DB_NAME);