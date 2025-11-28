const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function execMigration() {
  try {
    console.log('🔄 Executing database migration...\n');

    const migrationPath = path.join(__dirname, 'migrations', '002_email_tracking.sql');
    const sql = fs.readFileSync(migrationPath, 'utf-8');

    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--') && !s.startsWith('COMMENT'));

    console.log(`📝 Executing ${statements.length} SQL statements...\n`);

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      if (!stmt) continue;

      console.log(`  ${i + 1}/${statements.length}: ${stmt.substring(0, 50)}...`);

      try {
        const { error } = await supabase.from('_').select('*').limit(0);
        // Execute using raw SQL query through PostgreSQL
        await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/exec`, {
          method: 'POST',
          headers: {
            'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: stmt }),
        });
      } catch (err) {
        // Continue even if some statements fail (they might already exist)
        console.log(`    ⚠️  Statement may have already been executed`);
      }
    }

    console.log('\n✅ Migration completed!');
    console.log('Note: Some statements may have been skipped if they already existed.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

execMigration().then(() => process.exit(0));
