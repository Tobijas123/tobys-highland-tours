# Backup System

Automated daily backups for Toby's Highland Tours.

## Backup Location

```
~/backups/tobys-highland-tours/
├── 2026-01-25_02-30-00/
│   ├── database.sql.gz    # PostgreSQL dump
│   └── media.tar.gz       # Media uploads
├── 2026-01-24_02-30-00/
│   └── ...
└── backup.log             # Cron output log
```

## Schedule

- **When:** Daily at 02:30
- **Retention:** 14 days (older backups auto-deleted)

## Manual Backup

```bash
# Run backup now
./scripts/backup.sh

# Dry run (no actual backup)
./scripts/backup.sh --dry-run
```

## Restore Database

```bash
# 1. Find the backup
ls ~/backups/tobys-highland-tours/

# 2. Restore from backup
gunzip -c ~/backups/tobys-highland-tours/2026-01-25_02-30-00/database.sql.gz | \
  psql -h localhost -U postgres -d tobys_tours

# Or with credentials from .env.local:
source .env.local
gunzip -c ~/backups/tobys-highland-tours/2026-01-25_02-30-00/database.sql.gz | \
  psql "$DATABASE_URI"
```

## Restore Media Files

```bash
# 1. Extract to app directory
cd /home/ser/projects/tobys-highland-tours/app
tar -xzf ~/backups/tobys-highland-tours/2026-01-25_02-30-00/media.tar.gz

# This restores the 'media/' folder
```

## Crontab Entry

```
30 2 * * * /home/ser/projects/tobys-highland-tours/app/scripts/backup.sh >> /home/ser/backups/tobys-highland-tours/backup.log 2>&1
```

To edit: `crontab -e`

## Requirements

- `pg_dump` (PostgreSQL client)
- `DATABASE_URI` in `.env.local`
