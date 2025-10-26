#!/bin/bash

# Database Backup Script for UPAFA Journal
# This script creates daily backups of the PostgreSQL database

# Configuration
BACKUP_DIR="/var/www/upafa-journal/backups"
DB_NAME="journal_db"
DB_USER="journal_user"
DB_PASSWORD="YOUR_DB_PASSWORD_HERE"  # Change this!
DB_HOST="localhost"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Backup filename
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${DATE}.sql"

# Create backup
echo "Starting backup of database: $DB_NAME"
PGPASSWORD=$DB_PASSWORD pg_dump -h $DB_HOST -U $DB_USER $DB_NAME > $BACKUP_FILE

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo "Backup completed successfully: $BACKUP_FILE"
    
    # Compress the backup
    gzip $BACKUP_FILE
    echo "Backup compressed: ${BACKUP_FILE}.gz"
    
    # Delete old backups (keep only last N days)
    find $BACKUP_DIR -name "${DB_NAME}_*.sql.gz" -mtime +$RETENTION_DAYS -delete
    echo "Old backups deleted (older than $RETENTION_DAYS days)"
    
    # Show backup size
    BACKUP_SIZE=$(du -h "${BACKUP_FILE}.gz" | cut -f1)
    echo "Backup size: $BACKUP_SIZE"
else
    echo "ERROR: Backup failed!"
    exit 1
fi

# List all backups
echo ""
echo "Available backups:"
ls -lh $BACKUP_DIR/${DB_NAME}_*.sql.gz

echo ""
echo "Backup process completed at $(date)"
