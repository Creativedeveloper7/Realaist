# Database Setup Guide

## 🚨 IMPORTANT: Run These SQL Scripts in Order

### Step 1: Create Database Schema
1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project: `zviqhszbluqturpeoiuk`
3. Go to **SQL Editor**
4. Copy and paste the contents of `supabase-schema-safe.sql` (use the safe version!)
5. Click **Run** to execute the script

### Step 2: Create Database Triggers
1. In the same SQL Editor
2. Copy and paste the contents of `supabase-triggers-safe.sql` (use the safe version!)
3. Click **Run** to execute the script

### Step 3: Verify Tables Created
1. Go to **Table Editor** in your Supabase dashboard
2. You should see these tables:
   - ✅ `profiles`
   - ✅ `properties`
   - ✅ `blogs`
   - ✅ `scheduled_visits`
   - ✅ `favorites`

### Step 4: Test the Setup
1. Try creating a new account (email/password)
2. Try Google OAuth sign-in
3. Check the `profiles` table to see if user profiles are created

## 🔧 Troubleshooting

### If you get "table doesn't exist" errors:
- Make sure you ran `supabase-schema.sql` first
- Check the Table Editor to verify tables exist

### If you get "function doesn't exist" errors:
- Make sure you ran `supabase-triggers.sql` after the schema
- The triggers handle automatic profile creation

### If profiles aren't being created:
- Check the browser console for errors
- Verify the triggers are working by checking the `profiles` table

## 📋 What the Scripts Do

### `supabase-schema.sql`:
- Creates all database tables
- Sets up Row Level Security (RLS)
- Creates indexes for performance
- Defines user types and enums

### `supabase-triggers.sql`:
- Creates automatic profile creation when users sign up
- Handles Google OAuth users
- Provides functions to update profiles

## 🎯 Expected Behavior After Setup

1. **Email/Password Signup**: Creates user in `auth.users` + profile in `profiles`
2. **Google OAuth**: Creates user in `auth.users` + profile in `profiles`
3. **Login**: Fetches profile and redirects to correct dashboard
4. **User Type Detection**: Automatically detects buyer/developer from profile

## 🚀 Next Steps

After running both SQL scripts:
1. Test account creation
2. Test Google OAuth
3. Verify user profiles are created
4. Check that dashboards load correctly

If you still get errors, check the browser console and let me know what specific errors you see!
