# User Role Management for MärchenNails

This document outlines the user role management implementation for the MärchenNails application.

## Overview

The application supports three user roles:
- **Admin**: Full access to all administrative functionality
- **Staff**: Access to appointment management and client details
- **Client**: Regular user access to booking and profile management

New users signing up automatically receive the 'client' role by default.

## Implementation Details

### Database Setup

The user role system is implemented through database tables and policies:

1. **Database Tables**:
   - `profiles`: Contains user information including the `role` field
   - The `role` field is constrained to only accept 'admin', 'staff', or 'client' values

2. **Row-Level Security (RLS) Policies**:
   - Ensure users can only view their own profiles unless they are admins
   - Only admins can promote/demote users to/from admin role
   - Admins can change user roles as needed

### Migration Script

The migration script `20250324_user_role_management.sql` handles:
- Setting up the database schema for user roles
- Creating triggers to enforce role management rules
- Setting up proper RLS policies

### Admin Interface

A dedicated admin interface at `/admin/manage-users` allows administrators to:
- View all users in the system
- Edit user roles (promote/demote between client, staff, and admin)
- See user information such as email, creation date, and last login

## Setting Up the First Admin

To set up the first admin user:

1. First, sign up a regular user through the application
2. Run the provided script to promote this user to admin:

```bash
# First, configure environment variables
# Create a .env file with:
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key

# Then run the script with the user's email
node scripts/set-admin-role.js user@example.com
```

3. After successful promotion, the user will have admin access on next login

## Security Considerations

- Role changes are protected by RLS policies and triggers
- Only admins can promote users to admin role
- Users cannot change their own role
- Special security measures prevent unauthorized role elevation

## Troubleshooting

If users are unable to access admin features after role assignment:
1. Verify the user has logged out and back in to refresh their session
2. Check database logs for any trigger errors
3. Ensure the migration script has been run successfully
