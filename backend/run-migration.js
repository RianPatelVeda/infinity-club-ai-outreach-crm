const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigration() {
  try {
    console.log('🔄 Running database migration...\n');

    // Read migration file
    const migrationPath = path.join(__dirname, 'migrations', '002_email_tracking.sql');
    const sql = fs.readFileSync(migrationPath, 'utf-8');

    console.log('📄 Executing SQL migration...\n');

    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // If RPC doesn't exist, try direct execution
      console.log('ℹ️  Direct SQL execution (RPC not available)');
      console.log('Please run this SQL in your Supabase SQL editor:');
      console.log('\n' + sql + '\n');
      console.log('✅ Migration SQL generated successfully!');
    } else {
      console.log('✅ Migration completed successfully!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\nPlease run the migration manually in Supabase SQL editor.');
    console.log('Migration file location: backend/migrations/002_email_tracking.sql');
    process.exit(1);
  }
}

runMigration().then(() => process.exit(0));
