# Campaigns Database Setup Guide

This guide will help you set up the campaigns table in your Supabase database for the advertising campaign management system.

## Prerequisites

- Supabase project set up
- Access to Supabase SQL Editor
- Basic understanding of PostgreSQL

## Setup Options

### Option 1: Complete Setup (Recommended for New Projects)

Use the complete setup script if you're setting up the campaigns table for the first time:

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `docs/campaigns_table.sql`
4. Click **Run** to execute the script

This will create:
- The campaigns table with all fields
- All necessary indexes
- Row Level Security (RLS) policies
- Helper functions and triggers
- Views for statistics and recent campaigns

### Option 2: Safe Migration (Recommended for Existing Projects)

Use the migration script if you already have a campaigns table or want to add missing fields:

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `docs/campaigns_migration.sql`
4. Click **Run** to execute the script

This script is safe to run multiple times and will:
- Create the table if it doesn't exist
- Add missing columns if they don't exist
- Create indexes if they don't exist
- Update existing data as needed

## Table Structure

### Core Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Reference to auth.users |
| `campaign_name` | TEXT | Name of the campaign |
| `status` | TEXT | Campaign status (pending, active, failed, completed) |

### Targeting Fields

| Field | Type | Description |
|-------|------|-------------|
| `target_location` | TEXT[] | Array of target locations |
| `target_age_group` | TEXT | Target age group |
| `audience_interests` | TEXT[] | Array of audience interests |
| `platforms` | TEXT[] | Array of advertising platforms |

### Financial Fields

| Field | Type | Description |
|-------|------|-------------|
| `user_budget` | DECIMAL(12,2) | Total budget paid by user |
| `ad_spend` | DECIMAL(12,2) | Amount spent on ads (after platform fee) |
| `platform_fee` | DECIMAL(12,2) | Hidden platform fee |
| `total_paid` | DECIMAL(12,2) | Total amount charged to user |

### Campaign Management Fields

| Field | Type | Description |
|-------|------|-------------|
| `duration_start` | DATE | Campaign start date |
| `duration_end` | DATE | Campaign end date |
| `property_ids` | UUID[] | Array of property IDs |
| `google_ads_campaign_id` | TEXT | Google Ads campaign ID |
| `meta_ads_campaign_id` | TEXT | Meta Ads campaign ID |

### Admin Fields

| Field | Type | Description |
|-------|------|-------------|
| `admin_notes` | TEXT | Admin notes |
| `rejection_reason` | TEXT | Reason for rejection |
| `approved_by` | UUID | Admin who approved |
| `approved_at` | TIMESTAMPTZ | Approval timestamp |

### Timestamps

| Field | Type | Description |
|-------|------|-------------|
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

## Campaign Status Flow

```
pending → active (approved by admin)
pending → failed (rejected by admin)
active → completed (campaign finished)
```

## Row Level Security (RLS)

The table has RLS enabled with the following policies:

- **Users**: Can view, insert, and update their own campaigns
- **Admins**: Can view, update, and delete all campaigns
- **Service Role**: Has full access for backend operations

## Indexes

The following indexes are created for optimal performance:

- `idx_campaigns_user_id` - For user-specific queries
- `idx_campaigns_status` - For status-based filtering
- `idx_campaigns_created_at` - For chronological ordering
- `idx_campaigns_approved_at` - For approval tracking
- GIN indexes for array fields (property_ids, platforms, target_location, audience_interests)

## Views

### campaign_stats
Provides statistics grouped by status:
```sql
SELECT * FROM campaign_stats;
```

### recent_campaigns
Shows campaigns from the last 30 days with user information:
```sql
SELECT * FROM recent_campaigns;
```

## Testing the Setup

After running the setup script, you can test the table:

1. **Check if table exists:**
   ```sql
   SELECT * FROM campaigns LIMIT 1;
   ```

2. **Check indexes:**
   ```sql
   SELECT indexname FROM pg_indexes WHERE tablename = 'campaigns';
   ```

3. **Check RLS policies:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'campaigns';
   ```

## Troubleshooting

### Common Issues

1. **Permission Denied**
   - Ensure you're running the script as a user with sufficient privileges
   - Check if RLS policies are correctly configured

2. **Column Already Exists**
   - Use the migration script instead of the complete setup
   - The migration script handles existing columns gracefully

3. **Foreign Key Errors**
   - Ensure the `auth.users` table exists
   - Check that referenced user IDs exist

### Verification Queries

```sql
-- Check table structure
\d campaigns

-- Check if RLS is enabled
SELECT relrowsecurity FROM pg_class WHERE relname = 'campaigns';

-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'campaigns';

-- Test insert (replace with actual user ID)
INSERT INTO campaigns (user_id, campaign_name, target_location, target_age_group, duration_start, duration_end, user_budget, ad_spend, platform_fee, total_paid, property_ids, platforms)
VALUES ('your-user-id', 'Test Campaign', ARRAY['Nairobi'], '25-34', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 1000.00, 600.00, 400.00, 1000.00, ARRAY[]::UUID[], ARRAY['google']);
```

## Next Steps

After setting up the database:

1. **Update your application** to use the new table structure
2. **Test campaign creation** from the developer interface
3. **Test admin approval** from the admin interface
4. **Monitor performance** and adjust indexes if needed
5. **Set up monitoring** for campaign status changes

## Security Considerations

- Review RLS policies to ensure they match your security requirements
- Consider implementing admin role checking in your application
- Regularly audit campaign data and access patterns
- Set up proper backup procedures for campaign data

## Support

If you encounter issues:

1. Check the Supabase logs for detailed error messages
2. Verify that all required tables (auth.users, profiles) exist
3. Ensure your user has the necessary permissions
4. Test with a simple query first before running the full script
