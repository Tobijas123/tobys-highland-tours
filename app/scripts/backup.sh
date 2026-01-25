#!/usr/bin/env bash
#
# Backup script for Toby's Highland Tours
# - Dumps Postgres database to .sql.gz
# - Backs up media uploads folder
# - Rotates backups older than 14 days
#
# Usage: ./backup.sh [--dry-run]
#

set -euo pipefail

# Change to app directory and load environment
cd /home/ser/projects/tobys-highland-tours/app
set -a
source /home/ser/projects/tobys-highland-tours/app/.env.local
set +a

# Configuration
APP_DIR="/home/ser/projects/tobys-highland-tours/app"
MEDIA_DIR="$APP_DIR/media"
BACKUP_BASE="/var/backups/tobys-highland-tours"
RETENTION_DAYS=14
DRY_RUN=false

# Parse arguments
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=true
  echo "[DRY RUN] No actual backup will be created"
fi

# Fallback to home directory if /var/backups not writable
if ! mkdir -p "$BACKUP_BASE" 2>/dev/null || ! [ -w "$BACKUP_BASE" ]; then
  BACKUP_BASE="$HOME/backups/tobys-highland-tours"
  mkdir -p "$BACKUP_BASE"
fi

# Create dated backup directory
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_DIR="$BACKUP_BASE/$DATE"
mkdir -p "$BACKUP_DIR"

echo "========================================"
echo "Toby's Highland Tours - Backup Script"
echo "========================================"
echo "Date: $(date)"
echo "Backup location: $BACKUP_DIR"
echo ""

# Validate DATABASE_URI
if [ -z "${DATABASE_URI:-}" ]; then
  echo "ERROR: DATABASE_URI environment variable is not set"
  exit 1
fi

# Parse DATABASE_URI (format: postgres://user:pass@host:port/dbname)
DB_URI="$DATABASE_URI"
DB_URI="${DB_URI#postgres://}"
DB_URI="${DB_URI#postgresql://}"

DB_USER="${DB_URI%%:*}"
DB_URI="${DB_URI#*:}"
DB_PASS="${DB_URI%%@*}"
DB_URI="${DB_URI#*@}"
DB_HOST="${DB_URI%%:*}"
DB_URI="${DB_URI#*:}"
DB_PORT="${DB_URI%%/*}"
DB_NAME="${DB_URI#*/}"
DB_NAME="${DB_NAME%%\?*}"

echo "Database: $DB_NAME @ $DB_HOST:$DB_PORT"
echo ""

# ========================================
# 1. Database backup
# ========================================
echo "[1/3] Backing up database..."
DB_BACKUP_FILE="$BACKUP_DIR/database.sql.gz"

if [ "$DRY_RUN" = true ]; then
  echo "  [DRY RUN] Would create: $DB_BACKUP_FILE"
else
  PGPASSWORD="$DB_PASS" pg_dump \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --no-owner \
    --no-acl \
    --clean \
    --if-exists \
    2>/dev/null | gzip > "$DB_BACKUP_FILE"

  DB_SIZE=$(du -h "$DB_BACKUP_FILE" | cut -f1)
  echo "  ✓ Database backup complete: $DB_SIZE"
fi

# ========================================
# 2. Media files backup
# ========================================
echo "[2/3] Backing up media files..."
MEDIA_BACKUP_FILE="$BACKUP_DIR/media.tar.gz"

if [ ! -d "$MEDIA_DIR" ]; then
  echo "  ⚠ Media directory not found: $MEDIA_DIR"
elif [ "$DRY_RUN" = true ]; then
  MEDIA_COUNT=$(find "$MEDIA_DIR" -type f | wc -l)
  echo "  [DRY RUN] Would backup $MEDIA_COUNT files from: $MEDIA_DIR"
else
  tar -czf "$MEDIA_BACKUP_FILE" -C "$APP_DIR" media 2>/dev/null
  MEDIA_SIZE=$(du -h "$MEDIA_BACKUP_FILE" | cut -f1)
  MEDIA_COUNT=$(tar -tzf "$MEDIA_BACKUP_FILE" | wc -l)
  echo "  ✓ Media backup complete: $MEDIA_SIZE ($MEDIA_COUNT files)"
fi

# ========================================
# 3. Rotation - delete old backups
# ========================================
echo "[3/3] Rotating old backups (keeping last $RETENTION_DAYS days)..."

if [ "$DRY_RUN" = true ]; then
  OLD_COUNT=$(find "$BACKUP_BASE" -maxdepth 1 -type d -mtime +$RETENTION_DAYS 2>/dev/null | grep -v "^$BACKUP_BASE$" | wc -l)
  echo "  [DRY RUN] Would delete $OLD_COUNT old backup(s)"
else
  OLD_BACKUPS=$(find "$BACKUP_BASE" -maxdepth 1 -type d -mtime +$RETENTION_DAYS 2>/dev/null | grep -v "^$BACKUP_BASE$" || true)
  if [ -n "$OLD_BACKUPS" ]; then
    echo "$OLD_BACKUPS" | while read -r dir; do
      rm -rf "$dir"
      echo "  Deleted: $dir"
    done
  else
    echo "  No old backups to delete"
  fi
fi

# ========================================
# Summary
# ========================================
echo ""
echo "========================================"
echo "Backup complete!"
echo "========================================"
echo "Location: $BACKUP_DIR"

if [ "$DRY_RUN" = false ]; then
  echo ""
  echo "Files created:"
  ls -lh "$BACKUP_DIR"
fi

echo ""
echo "All backups:"
ls -lt "$BACKUP_BASE" | head -10
