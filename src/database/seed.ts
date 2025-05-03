import { db } from './db';
import { loanTypes } from './ubuntu-lend/schema';

async function seedDatabase() {
  console.log('🌱 Seeding database with initial data...');

  try {
    // Check if we already have loan types to avoid duplicates
    const existingLoanTypes = await db.select().from(loanTypes);
    
    if (existingLoanTypes.length === 0) {
      console.log('Adding default loan types...');
      
      try {
        // Insert default loan types
        await db.insert(loanTypes).values([
          {
            id: 1, // This matches our default loanTypeId
            name: "Personal Loan",
            description: "General purpose personal loans for various needs",
            minAmount: "1000.00",
            maxAmount: "50000.00",
            minTermMonths: 6,
            maxTermMonths: 60,
            baseInterestRate: "15.00",
            processingFeePercent: "2.50",
            active: 1
          },
          {
            name: "Business Loan",
            description: "Loans for business purposes and working capital",
            minAmount: "5000.00",
            maxAmount: "200000.00",
            minTermMonths: 12,
            maxTermMonths: 84,
            baseInterestRate: "12.50",
            processingFeePercent: "2.00",
            active: 1
          },
          {
            name: "Education Loan",
            description: "Loans for educational purposes and tuition fees",
            minAmount: "2000.00",
            maxAmount: "100000.00",
            minTermMonths: 12,
            maxTermMonths: 120,
            baseInterestRate: "8.50",
            processingFeePercent: "1.50",
            active: 1
          },
          {
            name: "Home Loan",
            description: "Loans for home improvements and renovations",
            minAmount: "10000.00",
            maxAmount: "500000.00",
            minTermMonths: 24,
            maxTermMonths: 240,
            baseInterestRate: "10.00",
            processingFeePercent: "1.00",
            active: 1
          }
        ]);
        
        // Verify that the loan types were created successfully
        const createdTypes = await db.select().from(loanTypes);
        console.log(`Successfully created ${createdTypes.length} loan types`);
        console.log('Default loan types added successfully!');
      } catch (insertError) {
        console.error('Error inserting loan types:', insertError);
        throw new Error(`Failed to create loan types: ${insertError instanceof Error ? insertError.message : String(insertError)}`);
      }
    } else {
      console.log(`Found ${existingLoanTypes.length} existing loan types, skipping seed.`);
    }

    console.log('✅ Database seeding completed!');
    return true;
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error; // Re-throw to handle in the calling function
  }
}

// Run the seed function if this script is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error seeding database:', error);
      process.exit(1);
    });
}

export default seedDatabase; 