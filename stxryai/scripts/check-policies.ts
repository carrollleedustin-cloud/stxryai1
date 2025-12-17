// Check what RLS policies exist on the users table
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lxtjkhphwihroktujzzi.supabase.co';
const supabaseServiceKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4dGpraHBod2locm9rdHVqenppIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDkwNTk2MywiZXhwIjoyMDgwNDgxOTYzfQ.LZEKQq72rYYHDYz2s2B8QOtmomzbHu-muubCwv2Estw';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkPolicies() {
  const { data, error } = await supabase.from('pg_policies').select('*').eq('tablename', 'users');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Current RLS policies on users table:');
  console.log(JSON.stringify(data, null, 2));
}

checkPolicies();
