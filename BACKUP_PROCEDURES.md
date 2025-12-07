# Database Backup & Recovery Procedures

## Automatic Backups (Supabase)

Supabase provides automatic daily backups for all projects:

### Backup Schedule
- **Frequency**: Daily at 02:00 UTC
- **Retention**: 7 days for Free tier, 30+ days for paid tiers
- **Type**: Full database backup (Point-in-Time Recovery available on paid plans)

### Access Backups
1. Log into Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to your project
3. Go to Database → Backups
4. Download or restore from available backup points

## Manual Backup Script

For on-demand backups, use the following script:

```bash
#!/bin/bash
# Manual Database Backup Script

# Set your Supabase project details
PROJECT_REF="your-project-ref"
DB_PASSWORD="your-database-password"
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Backup command using pg_dump
PGPASSWORD=$DB_PASSWORD pg_dump \
  -h db.${PROJECT_REF}.supabase.co \
  -U postgres \
  -d postgres \
  -F c \
  -f "${BACKUP_DIR}/backup_${DATE}.dump"

echo "Backup completed: ${BACKUP_DIR}/backup_${DATE}.dump"

# Optional: Upload to cloud storage (e.g., S3, Google Cloud Storage)
# aws s3 cp "${BACKUP_DIR}/backup_${DATE}.dump" s3://your-bucket/backups/
```

## Restore Procedures

### From Supabase Dashboard Backup
1. Go to Database → Backups
2. Select the backup point
3. Click "Restore"
4. Confirm the restoration

**WARNING**: This will overwrite current data. Download current state first if needed.

### From Manual Backup File
```bash
#!/bin/bash
# Restore from manual backup

PROJECT_REF="your-project-ref"
DB_PASSWORD="your-database-password"
BACKUP_FILE="./backups/backup_YYYYMMDD_HHMMSS.dump"

PGPASSWORD=$DB_PASSWORD pg_restore \
  -h db.${PROJECT_REF}.supabase.co \
  -U postgres \
  -d postgres \
  -c \
  $BACKUP_FILE

echo "Database restored from ${BACKUP_FILE}"
```

## Testing Backup Integrity

Regularly test backup restoration in a staging environment:

1. Create a test Supabase project
2. Restore latest backup
3. Run smoke tests:
   ```sql
   -- Check table counts
   SELECT
     schemaname,
     tablename,
     COUNT(*)
   FROM pg_tables
   WHERE schemaname = 'public'
   GROUP BY schemaname, tablename;

   -- Verify critical tables
   SELECT COUNT(*) FROM marketing_audits;
   SELECT COUNT(*) FROM beta_waitlist;
   SELECT COUNT(*) FROM clients;
   ```
4. Verify application functionality
5. Document any issues

## Backup Best Practices

### Do's
✅ Test backup restoration quarterly
✅ Store backups in multiple locations (Supabase + external storage)
✅ Encrypt sensitive backup files
✅ Document restoration procedures
✅ Monitor backup success/failure alerts
✅ Keep backup scripts in version control

### Don'ts
❌ Don't rely solely on automatic backups for critical data
❌ Don't store backups in the same infrastructure as production
❌ Don't share backup files containing sensitive data
❌ Don't skip testing restoration procedures
❌ Don't store database passwords in plain text

## Emergency Contacts

### Supabase Support
- Dashboard: https://supabase.com/dashboard
- Support: support@supabase.io
- Status Page: https://status.supabase.com

### Critical Data Recovery Steps
1. **Immediate**: Check Supabase Dashboard for automatic backups
2. **Within 1 hour**: Contact Supabase support if automatic restoration fails
3. **Within 2 hours**: Restore from most recent manual backup
4. **Document**: Record incident details and recovery steps taken

## Monitoring Backup Health

Create a weekly backup health check routine:

```sql
-- Check last backup timestamp (add monitoring table if needed)
-- Check database size growth
SELECT
  pg_size_pretty(pg_database_size('postgres')) as database_size;

-- Check critical table row counts
SELECT
  'marketing_audits' as table_name,
  COUNT(*) as row_count
FROM marketing_audits
UNION ALL
SELECT
  'beta_waitlist',
  COUNT(*)
FROM beta_waitlist;
```

## Backup Retention Policy

- **Daily backups**: Retain for 7 days (automatic)
- **Weekly backups**: Retain for 30 days (manual)
- **Monthly backups**: Retain for 90 days (manual)
- **Pre-deployment backups**: Retain indefinitely (manual)

## Data Integrity Checks

Before and after migrations, run integrity checks:

```sql
-- Check for duplicate emails (should return 0)
SELECT email, COUNT(*)
FROM marketing_audits
GROUP BY email
HAVING COUNT(*) > 1;

-- Verify foreign key relationships
SELECT conname, conrelid::regclass, confrelid::regclass
FROM pg_constraint
WHERE contype = 'f' AND connamespace = 'public'::regnamespace;

-- Check for NULL values in required fields
SELECT COUNT(*)
FROM marketing_audits
WHERE email IS NULL OR email = '';
```
