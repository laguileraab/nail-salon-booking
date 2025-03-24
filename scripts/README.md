# MärchenNails Admin Scripts

This directory contains utility scripts for administering the MärchenNails application.

## Set Admin Role Script

The `set-admin-role.js` script allows you to promote a user to the admin role. This is particularly useful for bootstrapping the first admin user when setting up the application.

### Prerequisites

Before running the script, you need to create a `.env` file in the project root with the following variables:

```
SUPABASE_URL=your_project_url
SUPABASE_SERVICE_KEY=your_service_role_key
```

You can get these values from your Supabase project dashboard:
1. `SUPABASE_URL`: Project URL found in the Project Settings
2. `SUPABASE_SERVICE_KEY`: Service Role Key (not the anon key) found in API settings

**IMPORTANT**: The service role key bypasses Row Level Security (RLS), so keep it secure and never expose it in client-side code.

### Usage

```bash
# Make sure you've installed dependencies
npm install

# Run the script with the email of the user you want to promote to admin
node set-admin-role.js user@example.com
```

### Example Output

```
Found user: user@example.com (Current role: client)
Successfully set user@example.com as admin
```

After running this script, the user will have admin access on their next login.

## Security Considerations

- Only use this script in controlled environments
- Never commit your `.env` file to version control
- After creating your first admin, it's recommended to use the admin interface to manage other users
