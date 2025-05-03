import { spawn } from 'child_process';
import seedDatabase from './seed';

/**
 * Run a command and return a promise that resolves when the command completes
 */
function runCommand(command: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`Running command: ${command} ${args.join(' ')}`);
    
    const childProcess = spawn(command, args, { 
      stdio: 'inherit',
      shell: process.platform === 'win32' // Use shell on Windows
    });
    
    childProcess.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
    
    childProcess.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Main migration function that runs the steps in sequence
 */
async function migrateDatabase() {
  try {
    console.log('🚀 Starting database migration process...');
    
    // Step 1: Push schema changes
    console.log('\n📦 Step 1: Pushing schema changes...');
    await runCommand('npm', ['run', 'db:push', '--', '--accept-data-loss']);
    
    // Step 2: Seed the database with initial data
    console.log('\n🌱 Step 2: Seeding database with initial data...');
    await seedDatabase();
    
    console.log('\n✅ Database migration completed successfully!');
  } catch (error) {
    console.error('\n❌ Database migration failed:', error);
    process.exit(1);
  }
}

// Run the migration if this script is executed directly
if (require.main === module) {
  migrateDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Error in migration process:', error);
      process.exit(1);
    });
}

export default migrateDatabase; 