// Check what RLS policies exist on the users table
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lxtjkhphwihroktujzzi.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
