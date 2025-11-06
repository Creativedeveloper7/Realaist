# Database Migration Workflow

This document outlines the process for running and tracking database migrations using Supabase MCP.

## Standard Workflow

### Step 1: Prepare Your Migration SQL

1. Write your SQL migration in a file or have it ready
2. Ensure it follows best practices:
   - Uses `IF NOT EXISTS` where possible
   - Is idempotent (can be run multiple times safely)
   - Includes proper error handling

### Step 2: Run Migration via Supabase MCP

Use the `mcp_supabase_apply_migration` tool:

```typescript
// Example: Creating a new table
await mcp_supabase_apply_migration({
  project_id: "zviqhszbluqturpeoiuk",
  name: "add_new_feature_table",
  query: `
    CREATE TABLE IF NOT EXISTS new_feature (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `
});
```

### Step 3: Save Migration Locally

**IMPORTANT**: After running the migration, immediately save it locally:

1. **Create a new file** in `migrations/` directory
2. **Use naming convention**: `YYYYMMDD_HHMMSS_<descriptive_name>.sql`
3. **Include metadata** at the top of the file:

```sql
-- Migration: add_new_feature_table
-- Date: 2025-01-27
-- Time: 14:30:22
-- Description: Creates the new_feature table for feature management
-- Project ID: zviqhszbluqturpeoiuk
-- Status: Applied

-- Migration SQL
CREATE TABLE IF NOT EXISTS new_feature (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Step 4: Update Migration History

Update `migrations/README.md` with the new migration entry:

```markdown
| 2025-01-27 | add_new_feature_table | Creates new_feature table | ✅ Applied |
```

## Migration File Template

Use this template for all new migrations:

```sql
-- Migration: <migration_name>
-- Date: YYYY-MM-DD
-- Time: HH:MM:SS
-- Description: <Brief description>
-- Project ID: <supabase_project_id>
-- Status: Applied

-- ============================================
-- MIGRATION SQL STARTS HERE
-- ============================================

-- Your SQL here

-- ============================================
-- MIGRATION SQL ENDS HERE
-- ============================================

-- Notes:
-- - Any additional notes or considerations
-- - Dependencies on other migrations
-- - Rollback instructions if needed
```

## Quick Reference

### Migration Naming Examples

- `20250127_143022_add_campaigns_table.sql`
- `20250127_150045_add_platforms_to_campaigns.sql`
- `20250127_160120_create_campaign_stats_view.sql`

### Common Migration Patterns

#### Adding a Column
```sql
-- Migration: add_column_to_table
ALTER TABLE table_name 
ADD COLUMN IF NOT EXISTS new_column TEXT;
```

#### Creating a Table
```sql
-- Migration: create_new_table
CREATE TABLE IF NOT EXISTS new_table (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- columns
);
```

#### Adding RLS Policy
```sql
-- Migration: add_rls_policy
CREATE POLICY IF NOT EXISTS "policy_name" 
ON table_name 
FOR SELECT 
USING (auth.uid() = user_id);
```

#### Creating Index
```sql
-- Migration: add_index
CREATE INDEX IF NOT EXISTS idx_table_column 
ON table_name(column_name);
```

## Checklist

Before marking a migration as complete:

- [ ] Migration SQL tested and working
- [ ] Migration file saved in `migrations/` directory
- [ ] File named with proper convention
- [ ] Metadata included in file header
- [ ] Migration history updated in README
- [ ] Changes committed to version control

## Troubleshooting

### Migration Failed
1. Check error message from Supabase
2. Fix the SQL
3. Create a new migration file (don't modify existing ones)
4. Re-run the migration

### Need to Rollback
1. Create a new migration file with rollback SQL
2. Document in migration history
3. Run rollback migration via MCP

## Example: Complete Migration Process

```bash
# 1. Prepare SQL
# File: migrations/20250127_143022_add_campaigns_table.sql

# 2. Run via MCP (in your conversation/script)
mcp_supabase_apply_migration({
  project_id: "zviqhszbluqturpeoiuk",
  name: "add_campaigns_table",
  query: "<SQL from file>"
})

# 3. File already saved locally ✓
# 4. Update README ✓
# 5. Commit to git ✓
```

