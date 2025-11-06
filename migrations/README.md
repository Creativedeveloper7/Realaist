# Database Migrations

This directory contains all database migrations applied to the Supabase project.

## Migration Naming Convention

Migrations should be named using the following format:
```
YYYYMMDD_HHMMSS_<descriptive_name>.sql
```

Example: `20250127_143022_add_campaigns_table.sql`

## Workflow

### When Running a Migration via Supabase MCP:

1. **Run the migration** using `mcp_supabase_apply_migration`
2. **Save the SQL locally** in this directory with the proper naming convention
3. **Update this README** with migration details

### Migration File Template

Each migration file should include:

```sql
-- Migration: <descriptive_name>
-- Date: YYYY-MM-DD
-- Description: Brief description of what this migration does
-- Author: Your name/team

-- Migration SQL here
```

### Example Migration Entry

```sql
-- Migration: add_campaigns_table
-- Date: 2025-01-27
-- Description: Creates the campaigns table for advertising campaign management
-- Author: Development Team

CREATE TABLE IF NOT EXISTS campaigns (
    -- table definition
);
```

## Migration History

| Date | Migration Name | Description | Status |
|------|---------------|-------------|--------|
| 2025-01-27 | Initial campaigns table | Created campaigns table with all fields | ✅ Applied |
| 2025-01-27 | Create payments table | Created payments table and payment_status enum, added payment columns to campaigns | ✅ Applied |
| 2025-01-27 | Update currency to KES | Updated default currency from USD to KES for payments table | ✅ Applied |

## Best Practices

1. **Always test migrations** on a development branch first
2. **Use IF NOT EXISTS** clauses when possible for idempotency
3. **Include rollback instructions** in comments if needed
4. **Document breaking changes** clearly
5. **Keep migrations atomic** - one logical change per migration
6. **Never modify existing migration files** - create new ones instead

## Running Migrations Locally

To apply migrations from this directory to your local Supabase instance:

1. Copy the SQL from the migration file
2. Run it in Supabase SQL Editor or via MCP

## Rollback

If a migration needs to be rolled back, create a new migration file with the rollback SQL and document it in the migration history.

