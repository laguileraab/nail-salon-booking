/**
 * Script to set a user's role to admin
 * Can be used directly: node scripts/set-admin-role.js <USER_EMAIL> <SUPABASE_URL> <SUPABASE_ANON_KEY>
 * Or via npm: npm run make-admin your@email.com
 * 
 * This script is intended to be used to bootstrap the first admin user
 * before the admin UI for user management is accessible.
 */

import { createClient } from '@supabase/supabase-js';

// Main function that can be called directly or imported and used
export default async function setAdminRole(userEmail, supabaseUrl, supabaseKey) {
  // Validate arguments - when being called from command line
  if (!userEmail) {
    console.error('Error: User email is required');
    console.error('Usage: node scripts/set-admin-role.js <USER_EMAIL> <SUPABASE_URL> <SUPABASE_ANON_KEY>');
    return;
  }

  // If called directly from command line, use arguments
  if (!supabaseUrl && process.argv.length > 3) {
    supabaseUrl = process.argv[3];
  }
  
  if (!supabaseKey && process.argv.length > 4) {
    supabaseKey = process.argv[4];
  }

  if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Supabase URL and key are required');
    console.error('Usage: node scripts/set-admin-role.js <USER_EMAIL> <SUPABASE_URL> <SUPABASE_ANON_KEY>');
    return;
  }

  // Initialize Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log(`Setting admin role for user: ${userEmail}`);
    console.log(`Using Supabase URL: ${supabaseUrl}`);
    
    // First, get the user ID from the email
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('email', userEmail)
      .single();

    if (userError) {
      console.error('Error finding user:', userError.message);
      return;
    }

    if (!userData) {
      console.error(`User with email ${userEmail} not found`);
      return;
    }

    console.log(`Found user: ${userData.email} (${userData.id})`);
    console.log(`Current role: ${userData.role || 'none'}`);

    // Update user to admin role
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', userData.id);

    if (updateError) {
      console.error('Error updating user role:', updateError.message);
      return;
    }

    console.log(`Successfully set ${userEmail} as admin!`);
  } catch (error) {
    console.error('Unexpected error:', error instanceof Error ? error.message : String(error));
  }
}

// If script is run directly (not imported), execute the function with command line args
if (import.meta.url === `file://${process.argv[1]}`) {
  const userEmail = process.argv[2];
  setAdminRole(userEmail);
}
