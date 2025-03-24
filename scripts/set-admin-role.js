/**
 * Script to set a user's role to admin
 * Usage: node set-admin-role.js <USER_EMAIL>
 * 
 * This script is intended to be used to bootstrap the first admin user
 * before the admin UI for user management is accessible.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Validate environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.error('Error: Missing environment variables. Please set SUPABASE_URL and SUPABASE_SERVICE_KEY');
  process.exit(1);
}

// Get email argument
const userEmail = process.argv[2];
if (!userEmail) {
  console.error('Error: Email argument is required');
  console.error('Usage: node set-admin-role.js <USER_EMAIL>');
  process.exit(1);
}

// Initialize Supabase client with service role key
// Note: The service role key bypasses RLS and should be kept secure
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function setAdminRole() {
  try {
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

    console.log(`Found user: ${userData.email} (Current role: ${userData.role})`);

    // Update the user's role to admin
    const { data, error } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', userData.id);

    if (error) {
      console.error('Error updating user role:', error.message);
      return;
    }

    console.log(`Successfully set ${userEmail} as admin`);
  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

setAdminRole();
