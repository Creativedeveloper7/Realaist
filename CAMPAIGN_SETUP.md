# Campaign Setup Instructions

## Database Setup

Before using the campaign creation feature, you need to ensure the campaigns table exists and has the required fields.

### 1. Run the Database Migration

Execute the following SQL script in your Supabase SQL editor to add the platforms field to the campaigns table:

```sql
-- Add platforms field to campaigns table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaigns' 
        AND column_name = 'platforms'
    ) THEN
        ALTER TABLE campaigns ADD COLUMN platforms TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- Add index for platforms field for better query performance
CREATE INDEX IF NOT EXISTS idx_campaigns_platforms ON campaigns USING GIN(platforms);

-- Update existing campaigns to have empty platforms array if they don't have one
UPDATE campaigns SET platforms = '{}' WHERE platforms IS NULL;
```

### 2. Verify Table Structure

The campaigns table should have the following structure:

- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to auth.users)
- `campaign_name` (TEXT)
- `target_location` (TEXT[])
- `target_age_group` (TEXT)
- `duration_start` (DATE)
- `duration_end` (DATE)
- `audience_interests` (TEXT[])
- `user_budget` (DECIMAL)
- `ad_spend` (DECIMAL)
- `platform_fee` (DECIMAL)
- `total_paid` (DECIMAL)
- `status` (TEXT)
- `google_ads_campaign_id` (TEXT)
- `property_ids` (UUID[])
- `platforms` (TEXT[]) - **This field needs to be added**
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

## Testing Campaign Creation

1. **Login as a developer** with properties in your account
2. **Navigate to the Campaign Ads dashboard**
3. **Click "Create Campaign"**
4. **Fill out the form**:
   - Select properties from your listings
   - Choose advertising platforms (Google Ads, Meta Ads, or both)
   - Set target location(s)
   - Select target age group
   - Add audience interests (optional)
   - Set campaign duration
   - Set campaign budget
5. **Click "Launch Campaign"**

## Expected Behavior

- ✅ Campaign should be created successfully
- ✅ Success message should appear
- ✅ Campaign should appear in the campaigns list
- ✅ Form should reset and modal should close

## Troubleshooting

### Common Issues

1. **"Missing required fields" error**: Ensure all required fields are filled
2. **"Unauthorized" error**: Make sure you're logged in
3. **"Failed to save campaign" error**: Check database connection and table structure
4. **"No properties available"**: Upload properties first before creating campaigns

### Debug Information

The API now includes detailed logging. Check the server console for:
- Request data received
- Validation results
- Database operations
- Error details

## Future Enhancements

- [ ] Integrate with actual payment processing
- [ ] Connect to Google Ads API
- [ ] Connect to Meta Ads API
- [ ] Add campaign performance tracking
- [ ] Implement campaign editing
- [ ] Add campaign analytics dashboard
