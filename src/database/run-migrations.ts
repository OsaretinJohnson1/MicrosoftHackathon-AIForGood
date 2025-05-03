import { migrate } from 'drizzle-orm/mysql2/migrator';
import { db } from './db';

async function runMigrations() {
  try {
    console.log('Running migrations manually...');
    
    // Run migrations
    await migrate(db, { migrationsFolder: './drizzle' });
    
    console.log('Migrations completed successfully!');
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    process.exit(0);
  }
}

runMigrations(); 