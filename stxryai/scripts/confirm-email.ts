// Quick script to confirm unverified email accounts
// Run with: npx ts-node scripts/confirm-email.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase environment variables');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

// Create admin client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function confirmAllEmails() {
  try {
    console.log('Fetching unconfirmed users...');

    // Get all users (service role can access auth.users)
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error('Error fetching users:', error);
      return;
    }

    const unconfirmedUsers = users?.filter(user => !user.email_confirmed_at) || [];

    console.log(`Found ${unconfirmedUsers.length} unconfirmed user(s)`);

    if (unconfirmedUsers.length === 0) {
      console.log('All users are already confirmed!');
      return;
    }

    // Confirm each user
    for (const user of unconfirmedUsers) {
      console.log(`Confirming email for: ${user.email}`);

      const { data, error: updateError } = await supabase.auth.admin.updateUserById(
        user.id,
        { email_confirm: true }
      );

      if (updateError) {
        console.error(`Error confirming ${user.email}:`, updateError);
      } else {
        console.log(`✓ Confirmed ${user.email}`);
      }
    }

    console.log('\nDone! All users confirmed. You can now log in.');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

confirmAllEmails();
