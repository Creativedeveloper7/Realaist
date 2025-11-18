# Admin Account Setup Guide

## Overview

Admin accounts must be **real Supabase accounts** (not mock admin) to approve campaigns and call Edge Functions. This guide explains how to create and manage admin accounts.

---

## ✅ Database Configuration

The database now supports `admin` as a valid `user_type`:

```sql
-- Enum values: 'buyer', 'developer', 'admin'
SELECT enumlabel FROM pg_enum WHERE enumtypid = 'user_type'::regtype;
```

**Status**: ✅ `admin` has been added to the `user_type` enum

---

## 🔐 Creating Admin Accounts

### Option 1: Create Admin Account via Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard** → **Authentication** → **Users**
2. **Click "Add User"** → **Create New User**
3. **Fill in the details**:
   - Email: `admin@realaist.com` (or your admin email)
   - Password: (set a strong password)
   - Auto Confirm User: ✅ (check this)
4. **After user is created**, update the profile:
   - Go to **Table Editor** → **profiles**
   - Find the user by email
   - Update `user_type` to `'admin'`

### Option 2: Create Admin Account via SQL

```sql
-- First, create the auth user (if not exists)
-- This is usually done through Supabase Dashboard or signup flow

-- Then update the profile to admin
UPDATE profiles
SET user_type = 'admin'
WHERE email = 'admin@realaist.com';
```

### Option 3: Sign Up as Admin (If Admin Signup Form Exists)

If you have an admin signup form, it will now correctly create admin profiles:
- The `user_type: 'admin'` is preserved (no longer converted to 'developer')
- The database trigger will create a profile with `user_type = 'admin'`
- The profile will be created automatically when the user signs up

---

## 🚫 Mock Admin Limitations

**Mock admin accounts (localStorage-based) CANNOT:**
- ❌ Approve campaigns
- ❌ Call Edge Functions (no valid JWT token)
- ❌ Access features requiring Supabase authentication

**Mock admin accounts CAN:**
- ✅ View admin dashboard UI
- ✅ Navigate admin pages
- ✅ View campaign lists (read-only)

---

## ✅ Real Admin Account Benefits

**Real Supabase admin accounts CAN:**
- ✅ Approve campaigns
- ✅ Create Google Ads campaigns via Edge Functions
- ✅ Access all admin features
- ✅ Have valid JWT tokens for API calls

---

## 🔍 Verifying Admin Account

### Check if User is Admin in Database:

```sql
SELECT id, email, user_type, first_name, last_name
FROM profiles
WHERE email = 'admin@realaist.com';
```

Expected result:
```
user_type: 'admin'
```

### Check if User Has Valid Session:

In browser console:
```javascript
const { data: { session } } = await supabase.auth.getSession();
console.log('Has session:', !!session);
console.log('User ID:', session?.user?.id);
```

Expected:
- `Has session: true`
- `User ID: <valid UUID>`

---

## 🔧 Admin Login Flow

### Current Implementation:

1. **Admin Login Page** (`/admin/login`):
   - Tries real Supabase authentication first
   - If successful → Creates real session → Can approve campaigns ✅
   - If fails → Falls back to mock admin → Cannot approve campaigns ❌

2. **Campaign Approval**:
   - Requires real Supabase session
   - Validates user ID is a valid UUID (not mock admin)
   - Uses JWT token for Edge Function calls

---

## 📝 Admin Signup Process

### If Admin Signup Form Exists:

1. Admin fills out signup form with `userType: 'admin'`
2. `AuthContext.signup()` preserves `userType: 'admin'` (no longer converts to 'developer')
3. `authService.signUp()` sends `user_type: 'admin'` in metadata
4. Database trigger `handle_new_user()` creates profile with `user_type = 'admin'`
5. Profile is created with correct admin type ✅

### Manual Admin Creation:

1. Create user in Supabase Auth (via Dashboard or signup)
2. Update profile: `UPDATE profiles SET user_type = 'admin' WHERE email = '...'`
3. Admin can now log in and approve campaigns ✅

---

## 🎯 Testing Admin Account

### Test Admin Login:

1. Go to `/admin/login`
2. Enter admin email (e.g., `admin@realaist.com`)
3. Enter password
4. Should create real Supabase session
5. Check browser console for session token

### Test Campaign Approval:

1. Log in as admin (real Supabase account)
2. Go to `/admin/campaigns`
3. Find a pending campaign with successful payment
4. Click "Approve"
5. Should successfully create Google Ads campaign ✅

---

## ⚠️ Common Issues

### Issue: "Authentication required" when approving campaigns

**Cause**: Using mock admin (no real Supabase session)

**Solution**: 
- Create real admin account in Supabase
- Log in with real credentials
- Verify session exists: `supabase.auth.getSession()`

### Issue: "Mock admin accounts cannot approve campaigns"

**Cause**: User ID is not a valid UUID (e.g., 'admin-1')

**Solution**: 
- Use real Supabase admin account
- User ID should be a UUID format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

### Issue: Profile created as 'developer' instead of 'admin'

**Cause**: Old code was converting admin to developer

**Solution**: 
- ✅ Fixed in `AuthContext.tsx` - now preserves admin userType
- ✅ Database enum now includes 'admin'
- Re-create admin account or update existing: `UPDATE profiles SET user_type = 'admin' WHERE email = '...'`

---

## 📋 Checklist for Admin Setup

- [ ] Database enum includes 'admin' (`user_type`)
- [ ] Admin account exists in Supabase Auth
- [ ] Profile has `user_type = 'admin'`
- [ ] Admin can log in and get valid session
- [ ] Admin can approve campaigns
- [ ] Edge Functions receive valid JWT token

---

## 🔒 Security Notes

1. **Admin accounts should be created manually** or through a secure signup process
2. **Never expose admin credentials** in code or environment variables
3. **Use strong passwords** for admin accounts
4. **Limit admin account creation** to authorized personnel only
5. **Monitor admin account activity** in Supabase Dashboard

---

**Last Updated**: 2025-11-17  
**Status**: ✅ Admin user_type support added to database  
**Status**: ✅ Signup flow preserves admin userType

