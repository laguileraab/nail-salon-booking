# Nail Salon Booking App

A modern web application for managing nail salon appointments, clients, services, and more. Built with React, TypeScript, and Supabase.

## Features

- Client appointment booking system
- Admin dashboard for salon management
- Service management
- Staff scheduling
- Promotions and discounts
- Client feedback system
- Reports and analytics

## Technology Stack

- Frontend: React with TypeScript
- UI Framework: Tailwind CSS
- Build Tool: Vite
- Backend & Database: Supabase
- Authentication: Supabase Auth
- Storage: Supabase Storage
- Hosting: Vercel

## Local Development Setup

1. Clone the repository

```bash
git clone <repository-url>
cd nail-salon-booking
```

2. Install dependencies

```bash
npm install
```

3. Create a `.env.local` file in the root directory with your Supabase credentials

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server

```bash
npm run dev
```

## Supabase Setup

1. Create a new Supabase project at [https://app.supabase.io](https://app.supabase.io)

2. Set up your database by executing the schema SQL script provided in `supabase/schema.sql`
   - Go to the SQL Editor in your Supabase dashboard
   - Copy and paste the contents of `supabase/schema.sql`
   - Run the SQL script

3. Set up storage buckets for images
   - Go to Storage in your Supabase dashboard
   - Create a new bucket called `services-images` for service images
   - Create a new bucket called `staff-avatars` for staff profile pictures
   - Update the RLS (Row Level Security) policies for these buckets to control access

## Vercel Deployment

1. Push your code to a GitHub repository

2. Create a new project in Vercel
   - Connect your GitHub repository
   - Set the framework preset to Vite
   - Set the build command to `npm run build`
   - Set the output directory to `dist`

3. Add environment variables in Vercel
   - Go to your project settings > Environment Variables
   - Add the following variables:
     ```
     VITE_SUPABASE_URL=your_supabase_project_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. Deploy your application
   - Click the "Deploy" button in Vercel
   - Wait for the build and deployment to complete

## Production Environment Considerations

1. **Database Security**:
   - Ensure all RLS (Row Level Security) policies are correctly configured
   - Review and test all security policies before going to production

2. **Environment Variables**:
   - Use Vercel's environment variable management for production secrets
   - Never commit sensitive keys to your repository

3. **Database Schema Updates**:
   - When updating your database schema, use migration scripts
   - Test schema changes in a staging environment first

## Maintenance and Updates

1. **Database Backups**:
   - Configure regular database backups in Supabase
   - Test the backup restoration process

2. **Monitoring**:
   - Set up monitoring for your Vercel deployment
   - Monitor Supabase database performance and usage

## Troubleshooting

### Common Deployment Issues

1. **Environment Variables**:
   - Ensure all environment variables are correctly set in Vercel
   - Verify that your application is using these variables correctly

2. **Build Failures**:
   - Check Vercel build logs for errors
   - Ensure all dependencies are correctly installed

3. **Database Connection Issues**:
   - Verify Supabase connection settings
   - Check network rules and security policies

## Additional Resources

- [Supabase Documentation](https://supabase.io/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Vite Documentation](https://vitejs.dev/guide/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
