import seedDatabase from './seed';
import { db } from './db';
import { loanTypes } from './ubuntu-lend/schema';
import { sql } from 'drizzle-orm';

/**
 * Initialize the database for first-time use
 * This is especially useful when setting up a new environment
 */
async function initializeDatabase() {
  try {
    console.log('🔧 Initializing database for first use...');

    // Check database connectivity
    console.log('Checking database connection...');
    try {
      // Simple query to check connection
      await db.execute(sql`SELECT 1`);
      console.log('✅ Database connection successful!');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw new Error('Database connection failed. Please check your database configuration.');
    }

    // Run the seed to create loan types
    console.log('\nSetting up required database records...');
    
    // Check if loan types table is empty
    const existingLoanTypes = await db.select().from(loanTypes);
    
    if (existingLoanTypes.length === 0) {
      console.log('No loan types found. Running seed script...');
      await seedDatabase();
    } else {
      console.log(`✅ Found ${existingLoanTypes.length} existing loan types.`);
      
      // Verify that ID 1 exists (required for default value)
      const hasDefaultType = existingLoanTypes.some((type: any) => type.id === 1);
      
      if (!hasDefaultType) {
        console.log('⚠️ Warning: No loan type with ID 1 found. This may cause issues with the default value in applications.');
        console.log('Creating default loan type with ID 1...');
        
        try {
          await db.insert(loanTypes).values({
            id: 1,
            name: "Personal Loan",
            description: "General purpose personal loans for various needs",
            minAmount: "1000.00",
            maxAmount: "50000.00",
            minTermMonths: 6,
            maxTermMonths: 60,
            baseInterestRate: "15.00",
            processingFeePercent: "2.50",
            active: 1
          });
          console.log('✅ Default loan type with ID 1 created successfully!');
        } catch (error) {
          console.error('❌ Error creating default loan type:', error);
        }
      }
    }

    console.log('\n✅ Database initialization completed successfully!');
    console.log('You can now use the application with the database.');
  } catch (error) {
    console.error('\n❌ Database initialization failed:', error);
    process.exit(1);
  }
}

// Run the init function if this script is executed directly
if (require.main === module) {
  initializeDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Error during database initialization:', error);
      process.exit(1);
    });
}

export default initializeDatabase; 