# Backend Setup Guide for Realaist

This guide will help you set up the backend infrastructure for the Realaist real estate platform using Supabase.

## Prerequisites

- Node.js and npm installed
- A Supabase account
- A Google Cloud Console account (for OAuth)

## Step 1: Supabase Setup

### 1.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `realaist`
   - Database Password: Generate a strong password
   - Region: Choose closest to your users
5. Click "Create new project"

### 1.2 Get Project Credentials

1. Go to Settings → API
2. Copy the following values:
   - Project URL
   - Anon public key

### 1.3 Set Up Database Schema

1. Go to the SQL Editor in your Supabase dashboard
2. Copy the contents of `supabase-schema.sql` from this project
3. Paste and run the SQL script
4. This will create all necessary tables, policies, and functions

## Step 2: Google OAuth Setup

### 2.1 Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable the Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client IDs
5. Configure the OAuth consent screen:
   - Application name: `Realaist`
   - User support email: Your email
   - Authorized domains: Add your domain
6. Create OAuth 2.0 Client ID:
   - Application type: Web application
   - Name: `Realaist Web Client`
   - Authorized JavaScript origins: 
     - `http://localhost:5173` (for development)
     - `https://yourdomain.com` (for production)
   - Authorized redirect URIs:
     - `https://your-project-ref.supabase.co/auth/v1/callback`

### 2.2 Configure Supabase Auth

1. In Supabase dashboard, go to Authentication → Providers
2. Enable Google provider
3. Add your Google OAuth credentials:
   - Client ID: From Google Cloud Console
   - Client Secret: From Google Cloud Console
4. Save the configuration

## Step 3: Environment Variables

### 3.1 Update .env.local

Replace the placeholder values in `.env.local` with your actual credentials:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Google OAuth (for Supabase Auth)
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here

# App Configuration
VITE_APP_URL=http://localhost:5173
```

## Step 4: Storage Buckets

The SQL schema automatically creates storage buckets, but you can verify them:

1. Go to Storage in Supabase dashboard
2. You should see these buckets:
   - `property-images` (public)
   - `blog-images` (public)
   - `avatars` (public)

## Step 5: Test the Setup

### 5.1 Start the Development Server

```bash
npm run dev
```

### 5.2 Test Authentication

1. Try signing up with email/password
2. Try signing in with Google
3. Check if user profiles are created in the `profiles` table

### 5.3 Test File Uploads

1. Try uploading property images
2. Try uploading blog images
3. Try uploading avatars

## Step 6: Production Deployment

### 6.1 Update Environment Variables

For production, update your environment variables:

```env
VITE_APP_URL=https://yourdomain.com
```

### 6.2 Update Google OAuth

Add your production domain to Google OAuth:
- Authorized JavaScript origins: `https://yourdomain.com`
- Authorized redirect URIs: `https://your-project-ref.supabase.co/auth/v1/callback`

### 6.3 Update Supabase Settings

1. Go to Authentication → URL Configuration
2. Add your production domain to Site URL
3. Add your production domain to Redirect URLs

## Database Schema Overview

### Tables Created

1. **profiles** - User profiles extending auth.users
2. **properties** - Property listings
3. **blogs** - Blog posts
4. **scheduled_visits** - Property viewing appointments
5. **favorites** - User's favorite properties

### Key Features

- Row Level Security (RLS) enabled on all tables
- Automatic profile creation on user signup
- File storage for images
- Proper indexing for performance
- Timestamp triggers for updated_at fields

## API Services Available

### AuthService
- `signUp()` - User registration
- `signIn()` - Email/password login
- `signInWithGoogle()` - Google OAuth
- `signOut()` - User logout
- `getCurrentUser()` - Get current user
- `updateProfile()` - Update user profile

### PropertiesService
- `getProperties()` - Get all properties with filters
- `getPropertyById()` - Get single property
- `createProperty()` - Create new property
- `updateProperty()` - Update property
- `deleteProperty()` - Delete property
- `getDeveloperProperties()` - Get developer's properties

### StorageService
- `uploadPropertyImage()` - Upload property images
- `uploadBlogImage()` - Upload blog images
- `uploadAvatar()` - Upload user avatars
- `deletePropertyImage()` - Delete property images
- `deleteBlogImage()` - Delete blog images
- `deleteAvatar()` - Delete user avatar
- `validateImageFile()` - Validate image files
- `compressImage()` - Compress images before upload

## Troubleshooting

### Common Issues

1. **Authentication not working**
   - Check if Google OAuth is properly configured
   - Verify redirect URIs match exactly
   - Check environment variables

2. **File uploads failing**
   - Verify storage buckets exist
   - Check RLS policies
   - Ensure user is authenticated

3. **Database errors**
   - Check if schema was applied correctly
   - Verify RLS policies
   - Check user permissions

### Getting Help

- Check Supabase logs in the dashboard
- Review browser console for errors
- Check network tab for failed requests
- Verify all environment variables are set

## Next Steps

1. Implement the remaining services (blogs, scheduled visits, favorites)
2. Add real-time subscriptions for live updates
3. Implement search functionality
4. Add email notifications
5. Set up analytics and monitoring
