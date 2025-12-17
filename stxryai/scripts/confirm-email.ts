// Quick script to confirm unverified email accounts
// Run with: npx ts-node scripts/confirm-email.ts

import { createClient, User } from '@supabase/supabase-js';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' }); // Or .env based on your setup

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL and Anon Key are required!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface AugmentedUser extends User {
  email_confirmed_at: string | null;
}

async function confirmAllEmails() {
  try {
    const {
      data: { users },
      error,
    } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error('Error listing users:', error);
      return;
    }

    if (!users) {
      console.log('No users found.');
      return;
    }

    const unconfirmedUsers: AugmentedUser[] =
      (users as AugmentedUser[])?.filter((user: AugmentedUser) => !user.email_confirmed_at) || [];

    console.log(`Found ${unconfirmedUsers.length} unconfirmed user(s)`);

    if (unconfirmedUsers.length === 0) {
      console.log('All users are already confirmed!');
      return;
    }

    // Confirm each user
    for (const user of unconfirmedUsers) {
      console.log(`Confirming email for: ${user.email}`);

      const { data, error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
        email_confirm: true,
      });

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
