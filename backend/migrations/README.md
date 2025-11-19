# Database Migrations

This directory contains SQL migration scripts for the Peekify database.

## Running Migrations

### On Neon (Production)

1. Go to your [Neon Console](https://console.neon.tech)
2. Select your project
3. Go to SQL Editor
4. Copy and paste the migration script
5. Execute the script

### Using psql (Local Development)

```bash
psql <your-database-url> -f backend/migrations/001_add_user_profile_columns.sql
```

Replace `<your-database-url>` with your DATABASE_URL from `.env`

### Using Node.js

You can also run migrations programmatically:

```javascript
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const runMigration = async (filename) => {
  const sql = fs.readFileSync(`backend/migrations/${filename}`, 'utf8');
  await pool.query(sql);
  console.log(`✅ Migration ${filename} completed`);
};

runMigration('001_add_user_profile_columns.sql')
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
```

## Migration History

### 001_add_user_profile_columns.sql
**Date:** 2024-11-19
**Description:** Add user profile functionality and friends system

**Changes:**
- Added `username` column to users (VARCHAR(50), UNIQUE)
- Added `bio` column to users (TEXT)
- Added `privacy_level` column to users (VARCHAR(20), default 'public')
- Added `timezone` column to users (VARCHAR(100), default 'UTC')
- Added `notification_time` column to users (TIME, default '21:30')
- Created `comment_likes` table with indexes
- Created `friends` table with indexes
- Created `friend_requests` table with indexes
- Added constraints to ensure data integrity

**Impact:**
- ✅ Enables profile pages by username
- ✅ Adds bio and privacy settings
- ✅ Enables timezone-aware notifications
- ✅ Adds complete friends system
- ✅ Enables comment liking functionality

**Before running:**
- Existing users will have NULL username (can be populated later)
- Existing users will have default privacy_level='public'
- All new functionality is backward compatible

## Creating New Migrations

1. Create a new SQL file with naming: `00X_description.sql`
2. Use `IF NOT EXISTS` clauses to make migrations idempotent
3. Add comments explaining the changes
4. Test on a development database first
5. Update this README with migration details

## Best Practices

- ✅ Always use `IF NOT EXISTS` for tables and indexes
- ✅ Always use `ADD COLUMN IF NOT EXISTS` for new columns
- ✅ Set DEFAULT values for new NOT NULL columns
- ✅ Add indexes for frequently queried columns
- ✅ Add CHECK constraints for data validation
- ✅ Use CASCADE for foreign key relationships appropriately
- ✅ Test migrations on a copy of production data first

## Rollback

To rollback a migration, create a reverse migration script:

```sql
-- Example: 001_add_user_profile_columns_ROLLBACK.sql
ALTER TABLE users DROP COLUMN IF EXISTS username;
ALTER TABLE users DROP COLUMN IF EXISTS bio;
-- ... etc
```

**⚠️ Warning:** Rollbacks can cause data loss. Always backup first!

## Troubleshooting

### "relation already exists"
This is normal if you run migrations multiple times. The `IF NOT EXISTS` clauses prevent errors.

### "column already exists"
Same as above - the migration is idempotent and safe to re-run.

### Permission denied
Ensure your database user has CREATE, ALTER, and INDEX privileges.

### Foreign key constraint violations
Check that referenced tables exist and contain the required data.

## Schema Status

Current schema version: **001**

Last updated: 2024-11-19

**Complete schema:** See `/backend/schema.sql` for the full database schema including all migrations.
