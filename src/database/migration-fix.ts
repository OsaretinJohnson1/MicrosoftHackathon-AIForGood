import { MySql2Database } from 'drizzle-orm/mysql2';
import { db } from './db';

async function fixMigrationIssue() {
  try {
    console.log('Starting migration fix...');
    
    // Check if the index exists before trying to drop it
    const checkIndexQuery = `
      SELECT COUNT(*) as count 
      FROM information_schema.statistics 
      WHERE table_schema = DATABASE() 
      AND table_name = 'loan_types' 
      AND index_name = 'loan_types_name_unique'
    `;
    
    const [indexResult]: any = await (db as MySql2Database<any>).execute(checkIndexQuery);
    const indexExists = indexResult[0].count > 0;
    
    if (indexExists) {
      console.log('Index loan_types_name_unique exists, attempting to drop it...');
      await (db as MySql2Database<any>).execute('ALTER TABLE `loan_types` DROP INDEX `loan_types_name_unique`;');
      console.log('Successfully dropped index loan_types_name_unique');
    } else {
      console.log('Index loan_types_name_unique does not exist, checking for alternative names...');
      
      // Check if the name column has any other unique constraints
      const allIndexesQuery = `
        SELECT index_name 
        FROM information_schema.statistics 
        WHERE table_schema = DATABASE() 
        AND table_name = 'loan_types' 
        AND column_name = 'name' 
        AND non_unique = 0
      `;
      
      const [allIndexesResult]: any = await (db as MySql2Database<any>).execute(allIndexesQuery);
      
      if (allIndexesResult.length > 0) {
        console.log('Found the following unique indexes on the name column:');
        for (const row of allIndexesResult) {
          console.log(`- ${row.index_name}`);
          
          // Optionally drop the found indexes if needed
          // await (db as MySql2Database<any>).execute(`ALTER TABLE \`loan_types\` DROP INDEX \`${row.index_name}\`;`);
          // console.log(`Dropped index ${row.index_name}`);
        }
      } else {
        console.log('No unique indexes found on the name column');
      }
    }
    
    console.log('Migration fix completed. You can now try running npm run db:migrate again.');
  } catch (error) {
    console.error('Error fixing migration:', error);
  } finally {
    process.exit(0);
  }
}

fixMigrationIssue(); 